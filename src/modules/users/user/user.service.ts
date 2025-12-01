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
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { ClsService } from 'nestjs-cls';
import { ILoggedUser } from '@/src/common/interfaces/request.interface';
import {
  emitWithContext,
  sendWithContext,
} from '@/src/common/helpers/microservice-request.helper';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { DeletedUserRepository } from '../deleted-user/repo/deleted-user.repo';
import { checkRecentlyDeletedConflict } from '@/src/common/functions/check-unique';
import { UserDocument } from './entity/user.entity';
import { ChangeEmailDto, VerifyEmailChangeDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { genSalt, hash, compare } from 'bcrypt';
import { TokenRepository } from '../../tokens/token/repo/token.repo';
import i18n from '@/src/i18n';
import { changeEmailMessage } from '@/src/common/constants/emial.messages';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PROVIDER, TOKEN_TYPE } from '@/src/common/constants/common.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,

    @Inject('ACCOUNT_SERVICE_TCP')
    private readonly accountServiceTcp: ClientProxy,

    @Inject('NOTIFICATION_SERVICE_KAFKA')
    private readonly notificationServiceKafka: ClientKafka,

    private readonly cls: ClsService,
    private readonly deletedUserRepo: DeletedUserRepository,
    private readonly tokenRepo: TokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await Promise.all([this.notificationServiceKafka.connect()]);
  }

  private sendEmail(to: string, subject: string, html: string): void {
    emitWithContext({
      client: this.notificationServiceKafka,
      topic: 'mail.send',
      payload: {
        from: '"Connectfy Team" <connectfy.team@gmail.com>',
        sender: 'Connectfy Team',
        to,
        subject,
        html,
      },
    });
  }

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

    const generalSettings = await sendWithContext({
      client: this.accountServiceTcp,
      endpoint: 'general-settings/findOne',
      payload: { query: { userId: _id } },
    });

    const notificationSettings = await sendWithContext({
      client: this.accountServiceTcp,
      endpoint: 'notification-settings/findOne',
      payload: { query: { userId: _id } },
    });

    const privacySettings = await sendWithContext({
      client: this.accountServiceTcp,
      endpoint: 'privacy-settings/findOne',
      payload: { query: { userId: _id } },
    });

    return {
      user: res,
      settings: {
        generalSettings,
        notificationSettings,
        privacySettings,
      },
    };
  }

  // ================== CREATE
  async create(data: AddUserDto): Promise<IReturnedUser> {
    const res = await this.repo.create(data);

    return res;
  }

  // ================== EDIT
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

  // ================== REMOVE
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

  // ================== FIND ONE
  async findOne(query: Record<string, any>): Promise<IReturnedUser | null> {
    const res = await this.repo.findOne({ query });
    return res;
  }

  // ================== EXIST BY FIELD
  async existByField(query: Record<string, any>): Promise<boolean> {
    const res = await this.repo.existsByField(query);

    return res;
  }

  // ================== CHANGE USERNAME
  async changeUsername(data: ChangeUsernameDto): Promise<IReturnedUser> {
    const { username, token } = data;
    const { user, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, username: oldUsername, provider } = user;
    const { language } = settings.generalSettings;

    const isUserExist = await this.repo.existsByField({ _id });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    const findToken = await this.tokenRepo.findOne({
      query: {
        $and: [{ token }, { userId: _id }],
      },
    });

    if (!findToken)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.BAD_REQUEST,
      );

    if (username === oldUsername)
      throw new BaseException(
        ExceptionMessages.SAME_DATA('userame', language),
        HttpStatus.BAD_REQUEST,
      );

    const userWithUsername = await this.repo.findOne({
      query: { username },
    });

    const deletedUsersWithUsername = await this.deletedUserRepo.findMany({
      username,
    });

    checkRecentlyDeletedConflict({
      user: userWithUsername,
      deletedUsers: deletedUsersWithUsername,
      value: username,
      _lang: language,
    });

    const updatedUser = (await this.repo.update({
      _id,
      username,
    })) as UserDocument;

    const updatedObj: IReturnedUser = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;

    await this.tokenRepo.removeMany({
      userId: _id,
      type: TOKEN_TYPE.CHANGE_USERNAME,
    });

    return updatedObj;
  }

  // ================== CHANGE EMAIL
  async changeEmail(data: ChangeEmailDto): Promise<{ statusCode: number }> {
    const { email, token } = data;
    const { user, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, email: oldEmail, provider } = user;
    const { language } = settings.generalSettings;

    const isUserExist = await this.repo.findOne({ query: { _id } });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    if (provider !== PROVIDER.PASSWORD)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(language),
        HttpStatus.BAD_REQUEST,
      );

    const findToken = await this.tokenRepo.findOne({
      query: {
        $and: [{ token }, { userId: _id }],
      },
    });

    if (!findToken)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    if (email === oldEmail)
      throw new BaseException(
        ExceptionMessages.SAME_DATA('userame', language),
        HttpStatus.BAD_REQUEST,
      );

    const userWithEmail = await this.repo.findOne({
      query: { email },
    });

    const deletedUsersWithEmail = await this.deletedUserRepo.findMany({
      email,
    });

    checkRecentlyDeletedConflict({
      user: userWithEmail,
      deletedUsers: deletedUsersWithEmail,
      value: email,
      _lang: language,
    });

    await this.tokenRepo.removeMany({
      userId: _id,
      type: TOKEN_TYPE.CHANGE_EMAIL,
    });

    const emailChangeToken = this.jwtService.sign(
      {
        userId: _id.toString(),
        email: email,
        type: TOKEN_TYPE.CHANGE_EMAIL,
      },
      {
        secret: process.env.EMAIL_CHANGE_SECRET || 'your-email-change-secret',
        expiresIn: '1h',
      },
    );
    const hashedToken = crypto
      .createHash('sha256')
      .update(emailChangeToken)
      .digest('hex');

    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.tokenRepo.save({
      userId: _id,
      token: hashedToken,
      expiresAt: tokenExpiry,
      type: TOKEN_TYPE.CHANGE_EMAIL,
    });

    this.sendEmail(
      email,
      i18n.t('email_messages.change_email.mail_subject', { lang: language }),
      changeEmailMessage(emailChangeToken, language),
    );

    return { statusCode: 200 };
  }

  // ================== VERIFY EMAIL CHANGE
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
      secret: process.env.EMAIL_CHANGE_SECRET || 'your-email-change-secret',
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

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const isTokenExist = await this.tokenRepo.findOne({
      query: {
        $and: [{ token: hashedToken }, { userId: _id }],
      },
    });

    if (!isTokenExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    const [updatedUser] = await Promise.all([
      await this.repo.update({
        _id,
        email: decoded.email,
      }),
      await this.tokenRepo.remove({
        $and: [{ token: hashedToken }, { userId: _id }],
      }),
    ]);

    const updatedObj = updatedUser?.toObject
      ? updatedUser?.toObject()
      : updatedUser;

    return updatedObj;
  }

  // ================== CHANGE PASSWORD
  async changePassword(data: ChangePasswordDto): Promise<IReturnedUser> {
    const { password, confirmPassword, token } = data;
    const { user: me, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, provider } = me;
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

    const findToken = await this.tokenRepo.findOne({
      query: {
        $and: [{ token }, { userId: _id }],
      },
    });

    if (!findToken)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.BAD_REQUEST,
      );

    const isPasswordSame = await compare(password, userObj.password);

    if (isPasswordSame)
      throw new BaseException(
        ExceptionMessages.SAME_DATA('password'),
        HttpStatus.BAD_REQUEST,
      );

    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    const updatedUser = (await this.repo.update({
      _id,
      password: hashedPassword,
    })) as UserDocument;

    const updatedObj: IReturnedUser = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;

    await this.tokenRepo.removeMany({
      userId: _id,
      type: TOKEN_TYPE.CHANGE_PASSWORD,
    });

    return updatedObj;
  }
}
