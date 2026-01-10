import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './repo/user.repo';
import { AddUserDto } from './dto/add.user.dto';
import { IReturnedUser } from './interface/user.interface';
import { EditUserDto } from './dto/edit.user.dto';
import { BaseException } from '@common/exceptions/base.exception';
import { RemoveUserDto } from './dto/remove.user.dto';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';
import { ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { ILoggedUser } from '@/src/common/interfaces/request.interface';
import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { UserDocument } from './entity/user.entity';
import { ChangeEmailDto, VerifyEmailChangeDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TokenRepository } from '../../tokens/token/repo/token.repo';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import {
  PHONE_NUMBER_ACTION,
  PROVIDER,
  TOKEN_TYPE,
} from '@/src/common/constants/common.enum';
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';
import { COUNTRIES } from '@/src/common/constants/constants';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@/src/common/services/email.service';
import { BcryptService } from '@/src/common/services/bcrypt.service';
import { TokenService } from '../../tokens/token/token.service';
import i18n from '@/src/i18n';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,

    @Inject('ACCOUNT_SERVICE_TCP')
    private readonly accountServiceTcp: ClientProxy,

    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: TokenService,
  ) {}

  // =======================
  // GET USER INFORMATIONS
  // =======================
  async me() {
    const { user, settings } = this.cls.get<ILoggedUser>('user');
    const { _id } = user;
    const { language: _lang } = settings.generalSettings;

    const res = await this.repo.findOne({
      query: { _id },
      fields: '-password -faceDescriptor',
    });

    if (!res)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const [account, generalSettings, notificationSettings, privacySettings] =
      await Promise.all([
        sendWithContext({
          client: this.accountServiceTcp,
          endpoint: 'account/findOne',
          payload: { query: { userId: _id } },
        }),
        sendWithContext({
          client: this.accountServiceTcp,
          endpoint: 'general-settings/findOne',
          payload: { query: { userId: _id } },
        }),
        sendWithContext({
          client: this.accountServiceTcp,
          endpoint: 'notification-settings/findOne',
          payload: { query: { userId: _id } },
        }),
        sendWithContext({
          client: this.accountServiceTcp,
          endpoint: 'privacy-settings/findOne',
          payload: { query: { userId: _id } },
        }),
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

    const newData = await this.repo.update(data);

    return newData as IReturnedUser;
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

    const res = await this.repo.remove(_id);

    return res as IReturnedUser;
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
    const { user, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, username: oldUsername } = user;
    const { language } = settings.generalSettings;

    const isUserExist = await this.repo.existsByField({ _id });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
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
        ExceptionMessages.SAME_DATA(i18n.t('common.username', { lng: language }), language),
        HttpStatus.BAD_REQUEST,
      );

    const userWithUsername = await this.repo.findOne({
      query: { username },
    });

    if (userWithUsername)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, language),
        HttpStatus.BAD_REQUEST,
      );

    const updatedUser = (await this.repo.update({
      _id,
      username,
    })) as UserDocument;

    const updatedObj: IReturnedUser = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_USERNAME }],
    });

    return updatedObj;
  }

  // =======================
  // CHANGE EMAIL
  // =======================
  async changeEmail(data: ChangeEmailDto): Promise<{ statusCode: number }> {
    const { email, token } = data;
    const { user, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, email: oldEmail, provider } = user;
    const { language: _lang } = settings.generalSettings;

    const isUserExist = await this.repo.findOne({ query: { _id } });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
      );

    if (provider !== PROVIDER.PASSWORD)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(_lang),
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
        ExceptionMessages.SAME_DATA(i18n.t('common.username', { lng: _lang }), _lang),
        HttpStatus.BAD_REQUEST,
      );

    const userWithEmail = await this.repo.findOne({
      query: { email },
    });

    if (userWithEmail)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, _lang),
        HttpStatus.BAD_REQUEST,
      );

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_EMAIL }],
    });

    const emailChangeToken = await this.tokenService.generateAndSaveJwtToken(
      _id,
      TOKEN_TYPE.CHANGE_EMAIL,
      'CHANGE_EMAIL_SECRET',
      '1h',
      60 * 60 * 1000,
    );

    this.emailService.changeEmail({
      to: email,
      _lang,
      additional: { token: emailChangeToken },
    });

    return { statusCode: 200 };
  }

  // =======================
  // VERIFY CHANGE EMAIL
  // =======================
  async verifyEmailChange(data: VerifyEmailChangeDto): Promise<IReturnedUser> {
    const { token } = data;
    const { user: me, settings } = this.cls.get<ILoggedUser>('user');
    const { _id } = me;
    const { language } = settings.generalSettings;

    const user = await this.repo.findOne({ query: { _id } });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    const decoded = this.jwtService.verify(token, {
      secret: this.config.get<string>('CHANGE_EMAIL_SECRET'),
    });

    if (
      decoded.type !== TOKEN_TYPE.CHANGE_EMAIL ||
      decoded.userId !== _id.toString()
    ) {
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(language),
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
      await this.repo.update({
        _id,
        email: decoded.email,
      }),
      await this.tokenService.remove({
        $and: [{ type: TOKEN_TYPE.CHANGE_EMAIL }, { userId: _id }],
      }),
    ]);

    const updatedObj = updatedUser?.toObject
      ? updatedUser?.toObject()
      : updatedUser;

    return updatedObj;
  }

  // =======================
  // CHANGE PASSWORD
  // =======================
  async changePassword(data: ChangePasswordDto): Promise<IReturnedUser> {
    const { password, confirmPassword, token } = data;
    const { user: me, settings } = this.cls.get<ILoggedUser>('user');
    const { _id } = me;
    const { language } = settings.generalSettings;

    if (password !== confirmPassword)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(language),
        HttpStatus.BAD_REQUEST,
      );

    const user = await this.repo.findOne({ query: { _id } });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    const userObj: IReturnedUser = user.toObject ? user.toObject() : user;

    if (userObj.provider !== PROVIDER.PASSWORD)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(language),
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
      userObj.password,
    );

    if (isPasswordSame)
      throw new BaseException(
        ExceptionMessages.SAME_DATA(i18n.t("common.password", { lng: language }), language),
        HttpStatus.BAD_REQUEST,
      );

    const hashedPassword = await this.bcryptService.hash(password);

    const updatedUser = (await this.repo.update({
      _id,
      password: hashedPassword,
    })) as UserDocument;

    const updatedObj: IReturnedUser = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_PASSWORD }],
    });

    return updatedObj;
  }

  // =======================
  // CHANGE PHONE NUMBER
  // =======================
  async changePhoneNumber(data: ChangePhoneNumberDto): Promise<IReturnedUser> {
    const { phoneNumber, token, action } = data;
    const { user, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, phoneNumber: oldPhoneNumber } = user;
    const { language } = settings.generalSettings;

    const isUserExist = await this.repo.existsByField({ _id });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
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
        ExceptionMessages.SAME_DATA(phoneNumber.fullPhoneNumber, language),
        HttpStatus.BAD_REQUEST,
      );

    if (action === PHONE_NUMBER_ACTION.UPDATE) {
      const country = COUNTRIES.find((c) => c.code === phoneNumber.countryCode);

      if (!country)
        throw new BaseException(
          ExceptionMessages.BAD_REQUEST_MESSAGE(language),
          HttpStatus.BAD_REQUEST,
        );

      const { numberLength } = country;

      if (phoneNumber.number.length !== numberLength)
        throw new BaseException(
          ExceptionMessages.INVALID_LENGTH_MESSAGE(language),
          HttpStatus.BAD_REQUEST,
        );

      const userWithPhoneNumber = await this.repo.findOne({
        query: { 'phoneNumber.fullPhoneNumber': phoneNumber.fullPhoneNumber },
      });

      if (userWithPhoneNumber)
        throw new BaseException(
          ExceptionMessages.ALREADY_EXISTS_MESSAGE(phoneNumber.fullPhoneNumber, language),
          HttpStatus.BAD_REQUEST,
        );
    }

    let updatedUser: UserDocument;

    if (action === PHONE_NUMBER_ACTION.UPDATE) {
      updatedUser = (await this.repo.update({
        _id,
        phoneNumber: phoneNumber,
      })) as UserDocument;
    } else {
      updatedUser = (await this.repo.update({
        _id,
        phoneNumber: null,
      })) as UserDocument;
    }

    const updatedObj: IReturnedUser = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type: TOKEN_TYPE.CHANGE_PHONE_NUMBER }],
    });

    return updatedObj;
  }
}
