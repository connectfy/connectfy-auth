import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './repo/user.repo';
import { AddUserDto } from './dto/add.user.dto';
import { IReturnedUser, IUser } from './interface/user.interface';
import { EditUserDto } from './dto/edit.user.dto';
import { BaseException } from '@common/exceptions/base.exception';
import { RemoveUserDto } from './dto/remove.user.dto';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';
import { ClsService } from 'nestjs-cls';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto, VerifyEmailChangeDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtService } from '@nestjs/jwt';
import {
  LANGUAGE,
  PHONE_NUMBER_ACTION,
  PROVIDER,
  TOKEN_TYPE,
} from '@/src/common/enums/enums';
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';
import { COUNTRIES, ENV, EXPIRE_DATES } from '@/src/common/constants/constants';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@/src/common/services/utils/email.service';
import { BcryptService } from '@/src/common/services/utils/bcrypt.service';
import { TokenService } from '../../tokens/token/token.service';
import i18n from '@/src/i18n';
import { AccountService } from '@/src/common/services/projects/account.service';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: TokenService,
    private readonly accountService: AccountService,
  ) {}

  // =======================
  // GET USER INFORMATIONS
  // =======================
  async me() {
    const { _id } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    const res = await this.repo.findOne({
      query: { _id }
    });

    if (!res)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const payload = { query: { userId: _id } };

    const [account, generalSettings, notificationSettings, privacySettings] =
      await Promise.all([
        this.accountService.findAccount(payload),
        this.accountService.findGeneralSettings(payload),
        this.accountService.findNotificationSettings(payload),
        this.accountService.findPrivacySettings(payload),
      ]);

    return {
      user: res,
      account,
      settings: {
        generalSettings,
        notificationSettings,
        privacySettings,
      },
    };
  }

  // =======================
  // CREATE USER
  // =======================
  async create(data: AddUserDto): Promise<IReturnedUser> {
    const res = await this.repo.create(data);

    return res;
  }

  // =======================
  // EDIT USER INFORMATIONS
  // =======================
  async edit(data: EditUserDto): Promise<IReturnedUser> {
    const { _id, _lang } = data;

    const foundData = await this.repo.findOne({ query: { _id } });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const newData = await this.repo.update({ _id: data._id }, data);

    return newData;
  }

  // =======================
  // REMOVE USER
  // =======================
  async remove(data: RemoveUserDto): Promise<IReturnedUser> {
    const { _id, _lang } = data;

    const foundData = await this.repo.findOne({ query: { _id } });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const res = await this.repo.remove({ _id });

    return res;
  }

  // =======================
  // FIND ONE USER
  // =======================
  async findOne(query: Record<string, any>): Promise<IReturnedUser | null> {
    const res = await this.repo.findOne({ query });
    return res;
  }

  // =======================
  // CHECK USER IS EXIST BY FIELD
  // =======================
  async existByField(query: Record<string, any>): Promise<boolean> {
    const res = await this.repo.existsByField(query);

    return res;
  }

  // =======================
  // CHANGE USERNAME
  // =======================
  async changeUsername(data: ChangeUsernameDto): Promise<IReturnedUser> {
    const { username, token } = data;
    const { _id, username: oldUsername } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    const isUserExist = await this.repo.existsByField({ _id });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );

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

    if (username === oldUsername)
      throw new BaseException(
        ExceptionMessages.SAME_DATA(
          i18n.t('common.username', { lng: lang }),
          lang,
        ),
        HttpStatus.BAD_REQUEST,
      );

    const userWithUsername = await this.repo.findOne({
      query: { username },
    });

    if (userWithUsername)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, lang),
        HttpStatus.BAD_REQUEST,
      );

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
    const { _id, email: oldEmail, provider } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    const isUserExist = await this.repo.findOne({ query: { _id } });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );

    if (provider !== PROVIDER.PASSWORD)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(lang),
        HttpStatus.BAD_REQUEST,
      );

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

    if (email === oldEmail)
      throw new BaseException(
        ExceptionMessages.SAME_DATA(
          i18n.t('common.username', { lng: lang }),
          lang,
        ),
        HttpStatus.BAD_REQUEST,
      );

    const userWithEmail = await this.repo.findOne({
      query: { email },
    });

    if (userWithEmail)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, lang),
        HttpStatus.BAD_REQUEST,
      );

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_EMAIL }],
    });

    const emailChangeToken = await this.tokenService.generateAndSaveJwtToken(
      _id,
      TOKEN_TYPE.CHANGE_EMAIL,
      'CHANGE_EMAIL_SECRET',
      EXPIRE_DATES.JWT.ONE_HOUR,
      EXPIRE_DATES.TOKEN.ONE_HOUR,
    );

    this.emailService.changeEmail({
      to: email,
      _lang: lang,
      additional: { token: emailChangeToken },
    });

    return { statusCode: 200 };
  }

  // =======================
  // VERIFY CHANGE EMAIL
  // =======================
  async verifyEmailChange(data: VerifyEmailChangeDto): Promise<IReturnedUser> {
    const { token } = data;
    const { _id } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    const user = await this.repo.findOne({ query: { _id } });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );

    const decoded = this.jwtService.verify(token, {
      secret: this.config.get<string>(ENV.AUTH.JWT.ACTIONS.CHANGE_EMAIL),
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
      await this.tokenService.remove({
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
    const { _id } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    if (password !== confirmPassword)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(lang),
        HttpStatus.BAD_REQUEST,
      );

    const user = await this.repo.findOne({ query: { _id } });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );

    if (user.provider !== PROVIDER.PASSWORD)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(lang),
        HttpStatus.BAD_REQUEST,
      );

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

    if (isPasswordSame)
      throw new BaseException(
        ExceptionMessages.SAME_DATA(
          i18n.t('common.password', { lng: lang }),
          lang,
        ),
        HttpStatus.BAD_REQUEST,
      );

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
    const { _id, phoneNumber: oldPhoneNumber } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    const isUserExist = await this.repo.existsByField({ _id });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );

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

    if (phoneNumber?.fullPhoneNumber === oldPhoneNumber?.fullPhoneNumber)
      throw new BaseException(
        ExceptionMessages.SAME_DATA(phoneNumber.fullPhoneNumber, lang),
        HttpStatus.BAD_REQUEST,
      );

    if (action === PHONE_NUMBER_ACTION.UPDATE) {
      const country = COUNTRIES.find((c) => c.code === phoneNumber.countryCode);

      if (!country)
        throw new BaseException(
          ExceptionMessages.BAD_REQUEST_MESSAGE(lang),
          HttpStatus.BAD_REQUEST,
        );

      const { numberLength } = country;

      if (phoneNumber.number.length !== numberLength)
        throw new BaseException(
          ExceptionMessages.INVALID_LENGTH_MESSAGE(lang),
          HttpStatus.BAD_REQUEST,
        );

      const userWithPhoneNumber = await this.repo.findOne({
        query: { 'phoneNumber.fullPhoneNumber': phoneNumber.fullPhoneNumber },
      });

      if (userWithPhoneNumber)
        throw new BaseException(
          ExceptionMessages.ALREADY_EXISTS_MESSAGE(
            phoneNumber.fullPhoneNumber,
            lang,
          ),
          HttpStatus.BAD_REQUEST,
        );
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
}
