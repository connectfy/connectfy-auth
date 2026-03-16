import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './repo/user.repo';
import { AddUserDto } from './dto/add.user.dto';
import { IReturnedUser } from './interface/user.interface';
import { EditUserDto } from './dto/edit.user.dto';
import { RemoveUserDto } from './dto/remove.user.dto';
import { ClsService } from 'nestjs-cls';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto, VerifyEmailChangeDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtService } from '@nestjs/jwt';
import {
  CLS_KEYS,
  LANGUAGE,
  PHONE_NUMBER_ACTION,
  TOKEN_TYPE,
  ExceptionMessages,
  BaseException,
  COUNTRIES,
  EXPIRE_DATES,
  TWO_FACTOR_ACTION,
  PROVIDER,
  USER_STATUS,
  DELETE_REASON_CODE,
  DELETE_REASON,
  IResponse,
} from 'connectfy-shared';
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';
import { NotificationsService } from '@/src/external-modules/notifications/notifications.service';
import { BcryptService } from '@/src/internal-modules/bcrypt/bcrypt.service';
import { TokenService } from '../../tokens/token/token.service';
import i18n from '@/src/i18n';
import { CheckUniqueDto } from './dto/check-unique.dto';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { TwoFactorDto } from './dto/two-factor.dto';
import { DeletedUserService } from '../deleted-user/deleted-user.service';
import { DeactivatedUsersService } from '../deactivated-users/deactivated-users.service';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { RefreshTokenService } from '../../tokens/refresh-token/refresh-token.service';
import { FindUserDto } from './dto/find.user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => DeactivatedUsersService))
    private readonly deactivatedUserService: DeactivatedUsersService,
    @Inject(forwardRef(() => DeletedUserService))
    private readonly deletedUserService: DeletedUserService,

    private readonly repo: UserRepository,
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
    private readonly emailService: NotificationsService,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  // =======================
  // CREATE USER
  // =======================
  async create(data: AddUserDto): Promise<IReturnedUser> {
    return await this.repo.create(data);
  }

  // =======================
  // EDIT USER INFORMATION'S
  // =======================
  async edit(data: EditUserDto): Promise<IResponse> {
    await this.repo.update({ _id: data._id }, data);
    return { success: true };
  }

  // =======================
  // REMOVE USER
  // =======================
  async remove(data: RemoveUserDto): Promise<IResponse> {
    const language = await this.cls.get(CLS_KEYS.LANG);
    const { _id } = data;

    const foundData = await this.repo.existsByField({ _id });

    if (!foundData) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );
    }

    await this.repo.remove({ _id });
    return { success: true };
  }

  // =======================
  // FIND ONE USER
  // =======================
  async findOne(
    data: FindUserDto,
    throwException: boolean = true,
  ): Promise<IReturnedUser | null> {
    const res = await this.repo.findOne(data);
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    if (!res && throwException) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );
    }

    return res;
  }

  // =======================
  // CHECK USER IS EXIST BY FIELD
  // =======================
  async existByField(query: Record<string, any>): Promise<boolean> {
    return await this.repo.existsByField(query);
  }

  // =======================
  // CHANGE USERNAME
  // =======================
  async changeUsername(data: ChangeUsernameDto): Promise<IResponse> {
    const { username, token } = data;
    const { _id, username: oldUsername } = this.cls.get<IReturnedUser>(
      CLS_KEYS.USER,
    );
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const hashedToken = this.tokenService.hashToken(token);

    await this.tokenService.findToken({
      query: {
        $and: [
          { token: hashedToken },
          { userId: _id },
          { type: TOKEN_TYPE.CHANGE_USERNAME },
        ],
      },
    });

    if (username === oldUsername) {
      throw new BaseException(
        ExceptionMessages.SAME_DATA(
          i18n.t('common.username', { lng: lang }),
          lang,
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const isExist = await this.existByField({ username });

    if (isExist) {
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, lang),
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.repo.update(
      { _id },
      {
        _id,
        username,
      },
    );

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_USERNAME }],
    });

    return { success: true };
  }

  // =======================
  // CHANGE EMAIL
  // =======================
  async changeEmail(data: ChangeEmailDto): Promise<{ statusCode: number }> {
    const { email, token } = data;
    const {
      _id,
      email: oldEmail,
      provider,
    } = this.cls.get<IReturnedUser>(CLS_KEYS.USER);
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    if (provider !== PROVIDER.PASSWORD) {
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(language),
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedToken = this.tokenService.hashToken(token);

    await this.tokenService.findToken({
      query: {
        $and: [
          { token: hashedToken },
          { userId: _id },
          { type: TOKEN_TYPE.CHANGE_EMAIL },
        ],
      },
    });

    if (email === oldEmail) {
      throw new BaseException(
        ExceptionMessages.SAME_DATA(
          i18n.t('common.username', { lng: language }),
          language,
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const userWithEmail = await this.existByField({ email });

    if (userWithEmail) {
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, language),
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_EMAIL }],
    });

    const emailChangeToken = await this.tokenService.generateAndSaveJwtToken({
      userId: _id,
      type: TOKEN_TYPE.CHANGE_EMAIL,
      secret: ENVIRONMENT_VARIABLES.CHANGE_EMAIL_SECRET || '',
      jwtExp: EXPIRE_DATES.JWT.ONE_HOUR,
      tokenExp: EXPIRE_DATES.TOKEN.ONE_HOUR,
      payload: { email },
    });

    this.emailService.changeEmail({
      to: email,
      language,
      additional: { token: emailChangeToken },
    });

    return { statusCode: 200 };
  }

  // =======================
  // VERIFY CHANGE EMAIL
  // =======================
  async verifyEmailChange(data: VerifyEmailChangeDto): Promise<IResponse> {
    const { token } = data;
    const { _id } = this.cls.get<IReturnedUser>(CLS_KEYS.USER);
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const decoded = this.jwtService.verify(token, {
      secret: ENVIRONMENT_VARIABLES.CHANGE_EMAIL_SECRET,
    });

    if (
      decoded.type !== TOKEN_TYPE.CHANGE_EMAIL ||
      decoded.userId !== _id.toString()
    ) {
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(lang),
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedToken = this.tokenService.hashToken(token);

    await this.tokenService.findToken({
      query: {
        $and: [
          { token: hashedToken },
          { userId: _id },
          { type: TOKEN_TYPE.CHANGE_EMAIL },
        ],
      },
    });

    await Promise.all([
      await this.repo.update(
        {
          _id,
        },
        {
          _id,
          email: decoded.email,
        },
      ),
      await this.tokenService.removeMany({
        $and: [{ type: TOKEN_TYPE.CHANGE_EMAIL }, { userId: _id }],
      }),
    ]);

    return { success: true, email: decoded.email };
  }

  // =======================
  // CHANGE PASSWORD
  // =======================
  async changePassword(data: ChangePasswordDto): Promise<IResponse> {
    const { password, confirmPassword, token } = data;
    const { _id, provider } = this.cls.get<IReturnedUser>(CLS_KEYS.USER);
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    if (password !== confirmPassword) {
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(lang),
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.repo.findOne({
      query: { _id },
      fields: '+password',
    });

    if (!user) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );
    }

    if (provider !== PROVIDER.PASSWORD) {
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE(lang),
        HttpStatus.CONFLICT,
      );
    }

    const hashedToken = this.tokenService.hashToken(token);

    await this.tokenService.findToken({
      query: {
        $and: [
          { token: hashedToken },
          { userId: _id },
          { type: TOKEN_TYPE.CHANGE_PASSWORD },
        ],
      },
    });

    const isPasswordSame = await this.bcryptService.compare(
      password,
      user.password,
    );

    if (isPasswordSame) {
      throw new BaseException(
        ExceptionMessages.SAME_DATA(
          i18n.t('common.password', { lng: lang }),
          lang,
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.bcryptService.hash(password);

    await this.repo.update(
      {
        _id,
      },
      {
        _id,
        password: hashedPassword,
      },
    );

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_PASSWORD }],
    });

    return { success: true };
  }

  // =======================
  // CHANGE PHONE NUMBER
  // =======================
  async changePhoneNumber(data: ChangePhoneNumberDto): Promise<IResponse> {
    const { phoneNumber, token, action } = data;
    const { _id, phoneNumber: oldPhoneNumber } = this.cls.get<IReturnedUser>(
      CLS_KEYS.USER,
    );
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const hashedToken = this.tokenService.hashToken(token);

    await this.tokenService.findToken({
      query: {
        $and: [
          { token: hashedToken },
          { userId: _id },
          { type: TOKEN_TYPE.CHANGE_PHONE_NUMBER },
        ],
      },
    });

    if (
      phoneNumber &&
      phoneNumber?.fullPhoneNumber === oldPhoneNumber?.fullPhoneNumber
    ) {
      throw new BaseException(
        ExceptionMessages.SAME_DATA(phoneNumber.fullPhoneNumber, lang),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (action === PHONE_NUMBER_ACTION.UPDATE) {
      const country = COUNTRIES.find(
        (c) => c.code === phoneNumber?.countryCode,
      );

      if (!country) {
        throw new BaseException(
          ExceptionMessages.BAD_REQUEST_MESSAGE(lang),
          HttpStatus.BAD_REQUEST,
        );
      }

      const { numberLength } = country;

      if (phoneNumber?.number.length !== numberLength) {
        throw new BaseException(
          ExceptionMessages.INVALID_LENGTH_MESSAGE(lang),
          HttpStatus.BAD_REQUEST,
        );
      }

      const userWithPhoneNumber = await this.existByField({
        $and: [
          { 'phoneNumber.fullPhoneNumber': phoneNumber?.fullPhoneNumber },
          { _id: { $ne: _id } },
        ],
      });

      if (userWithPhoneNumber) {
        throw new BaseException(
          ExceptionMessages.ALREADY_EXISTS_MESSAGE(
            phoneNumber?.fullPhoneNumber,
            lang,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    let updatedPhoneNumber;

    if (action === PHONE_NUMBER_ACTION.REMOVE) {
      updatedPhoneNumber = null;
    } else {
      updatedPhoneNumber = phoneNumber;
    }

    await this.repo.update(
      { _id },
      {
        _id,
        phoneNumber: phoneNumber,
      },
    );

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_PHONE_NUMBER }],
    });

    return { success: true, updatedPhoneNumber };
  }

  // =======================
  // CHECK UNIQUE
  // =======================
  async checkUnique(data: CheckUniqueDto): Promise<boolean> {
    const { field, value } = data;
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const isUserExist = await this.existByField({ [field]: value });

    if (isUserExist)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(value, lang),
        HttpStatus.BAD_REQUEST,
      );

    return true;
  }

  // =======================
  // ENABLE/DISABLE 2FA
  // =======================
  async updateTwoFactorAuth(data: TwoFactorDto): Promise<IResponse> {
    const { token, action } = data;

    const { _id, isTwoFactorEnabled, provider } = this.cls.get<IReturnedUser>(
      CLS_KEYS.USER,
    );
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    if (provider !== PROVIDER.PASSWORD) {
      throw new BaseException(
        ExceptionMessages.FORBIDDEN_MESSAGE(lang),
        HttpStatus.FORBIDDEN,
      );
    }

    const hashedToken = this.tokenService.hashToken(token);

    await this.tokenService.findToken({
      query: {
        $and: [
          { token: hashedToken },
          { userId: _id },
          { type: TOKEN_TYPE.TWO_FACTOR },
        ],
      },
    });

    if (
      (isTwoFactorEnabled && action === TWO_FACTOR_ACTION.ENABLE) ||
      (!isTwoFactorEnabled && action === TWO_FACTOR_ACTION.DISABLE)
    ) {
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE,
        HttpStatus.CONFLICT,
      );
    }

    const finalData = {
      _id,
      isTwoFactorEnabled: action === TWO_FACTOR_ACTION.ENABLE,
    };

    await Promise.all([
      this.repo.update({ _id }, finalData),
      this.tokenService.removeMany({
        $and: [{ userId: _id }, { type: TOKEN_TYPE.TWO_FACTOR }],
      }),
    ]);

    return { success: true };
  }

  // =================================
  // DEACTIVATE ACCOUNT
  // =================================
  async deactivateAccount(data: DeactivateAccountDto) {
    const { token } = data;
    const { _id } = this.cls.get<IReturnedUser>(CLS_KEYS.USER);
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const hashedToken = this.tokenService.hashToken(token);

    const deactivateToken = await this.tokenService.findToken({
      query: {
        $and: [
          { token: hashedToken },
          { userId: _id },
          { type: TOKEN_TYPE.DEACTIVATE_ACCOUNT },
        ],
      },
    });

    if (deactivateToken.expiresAt && deactivateToken.expiresAt < new Date()) {
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(lang),
        HttpStatus.GONE,
      );
    }

    await Promise.all([
      this.deactivatedUserService.create({ userId: _id }),
      this.tokenService.removeTokensByUserId(_id),
      this.refreshTokenService.removeTokenByUserId(_id),
      this.repo.update({ _id }, { _id, status: USER_STATUS.INACTIVE }),
    ]);

    return { statusCode: 200 };
  }

  // =================================
  // DELETE ACCOUNT
  // =================================
  async deleteAccount(data: DeleteAccountDto): Promise<{ statusCode: 200 }> {
    const { token } = data;
    const { _id, email } = this.cls.get<IReturnedUser>(CLS_KEYS.USER);
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const hashedToken = this.tokenService.hashToken(token);
    const deleteToken = await this.tokenService.findToken({
      query: {
        $and: [
          { token: hashedToken },
          { userId: _id },
          { type: TOKEN_TYPE.DELETE_ACCOUNT },
        ],
      },
    });

    const now = new Date();

    if (!deleteToken || now >= deleteToken.expiresAt) {
      if (deleteToken) {
        await this.tokenService.removeToken({ _id: deleteToken._id });
      }

      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(lang),
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.existByField({ _id });

    if (!user) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );
    }

    const reasonDescription =
      data.reasonCode === DELETE_REASON_CODE.FOUND_ALTERNATIVE
        ? null
        : data.reasonDescription;

    const [newToken] = await Promise.all([
      this.tokenService.generateAndSaveJwtToken({
        userId: _id,
        type: TOKEN_TYPE.RESTORE_ACCOUNT,
        secret: ENVIRONMENT_VARIABLES.RESTORE_ACCOUNT_SECRET || '',
        jwtExp: EXPIRE_DATES.JWT.ONE_MONTH,
        tokenExp: EXPIRE_DATES.TOKEN.ONE_MONTH,
      }),
      this.tokenService.removeMany({
        $and: [{ userId: _id }, { type: { $ne: TOKEN_TYPE.RESTORE_ACCOUNT } }],
      }),
      this.refreshTokenService.removeTokenByUserId(_id),
      this.deletedUserService.create({
        userId: _id,
        reason: DELETE_REASON.USER_REQUEST,
        reasonCode: data.reasonCode,
        reasonDescription,
      }),
    ]);

    this.emailService.deleteAccountCompleted({
      to: email,
      language: lang,
      additional: { token: newToken },
    });

    return { statusCode: 200 };
  }
}
