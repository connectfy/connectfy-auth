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
import { DeletedUserRepository } from '../deleted-user/repo/deleted-user.repo';
import { checkRecentlyDeletedConflict } from '@/src/common/functions/check-unique';
import { UserDocument } from './entity/user.entity';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { genSalt, hash, compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepository,

    @Inject('ACCOUNT_SERVICE_TCP')
    private readonly accountServiceTcp: ClientProxy,

    private readonly cls: ClsService,
    private readonly deletedUserRepo: DeletedUserRepository,
  ) {}

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
    const { username } = data;
    const { user, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, username: oldUsername } = user;
    const { language } = settings.generalSettings;

    const isUserExist = await this.repo.existsByField({ _id });

    if (!isUserExist)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
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

    return updatedObj;
  }

  // ================== CHANGE EMAIL
  async changeEmail(data: ChangeEmailDto): Promise<IReturnedUser> {
    const { email } = data;
    const { user, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, email: oldEmail } = user;
    const { language } = settings.generalSettings;

    const isUserExist = await this.repo.existsByField({ _id });

    if (!isUserExist)
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

    const updatedUser = (await this.repo.update({
      _id,
      email,
    })) as UserDocument;

    const updatedObj: IReturnedUser = updatedUser.toObject
      ? updatedUser.toObject()
      : updatedUser;

    return updatedObj;
  }

  // ================== CHANGE PASSWORD
  async changePassword(data: ChangePasswordDto): Promise<IReturnedUser> {
    const { password, confirmPassword } = data;
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

    return updatedObj;
  }
}
