import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './repo/user.repo';
import { AddUserDto } from './dto/add.user.dto';
import { IReturnedUser, IUser } from './interface/user.interface';
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
} from 'connectfy-shared';
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';
import { NotificationsService } from '@/src/external-modules/notifications/notifications.service';
import { BcryptService } from '@/src/internal-modules/bcrypt/bcrypt.service';
import { TokenService } from '../../tokens/token/token.service';
import i18n from '@/src/i18n';
import { CheckUniqueDto } from './dto/check-unique.dto';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { TwoFactorDto } from './dto/two-factor.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
    private readonly emailService: NotificationsService,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: TokenService,
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
  async edit(data: EditUserDto): Promise<IReturnedUser> {
    const { _id } = data;
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const foundData = await this.repo.findOne({ query: { _id } });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );

    return await this.repo.update({ _id: data._id }, data);
  }

  // =======================
  // REMOVE USER
  // =======================
  async remove(data: RemoveUserDto): Promise<IReturnedUser> {
    const language = await this.cls.get(CLS_KEYS.LANG);
    const { _id } = data;

    const foundData = await this.repo.findOne({ query: { _id } });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    return await this.repo.remove({ _id });
  }

  // =======================
  // FIND ONE USER
  // =======================
  async findOne(query: Record<string, any>): Promise<IReturnedUser | null> {
    return (await this.repo.findOne({ query })) as IReturnedUser;
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
  async changeUsername(data: ChangeUsernameDto): Promise<IReturnedUser> {
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

    const userWithUsername = await this.repo.existsByField({ username });

    if (userWithUsername) {
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

    return updatedUser;
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

    const userWithEmail = await this.repo.existsByField({ email });

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
  async verifyEmailChange(data: VerifyEmailChangeDto): Promise<IReturnedUser> {
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

    const [updatedUser] = await Promise.all([
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

    return updatedUser;
  }

  // =======================
  // CHANGE PASSWORD
  // =======================
  async changePassword(data: ChangePasswordDto): Promise<IReturnedUser> {
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

    const updatedUser = await this.repo.update(
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

    return updatedUser;
  }

  // =======================
  // CHANGE PHONE NUMBER
  // =======================
  async changePhoneNumber(data: ChangePhoneNumberDto): Promise<IReturnedUser> {
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

      const userWithPhoneNumber = await this.repo.existsByField({
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

    let updatedUser: IReturnedUser;

    if (action === PHONE_NUMBER_ACTION.UPDATE) {
      updatedUser = await this.repo.update(
        { _id },
        {
          _id,
          phoneNumber: phoneNumber,
        },
      );
    } else {
      updatedUser = await this.repo.update(
        { _id },
        {
          _id,
          phoneNumber: null,
        },
      );
    }

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_PHONE_NUMBER }],
    });

    return updatedUser;
  }

  // =======================
  // CHECK UNIQUE
  // =======================
  async checkUnique(data: CheckUniqueDto): Promise<boolean> {
    const { field, value } = data;
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const isUserExist = await this.repo.existsByField({ [field]: value });

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
  async updateTwoFactorAuth(data: TwoFactorDto): Promise<IReturnedUser> {
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

    const res = await this.repo.update({ _id }, finalData);
    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_PHONE_NUMBER }],
    });

    return res;
  }
}
