import { ConfigService } from '@nestjs/config';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../users/user/repo/user.repo';
import { RefreshTokenService } from '../tokens/refresh-token/refresh-token.service';
import { GoogleAuthSignupDto, SignupDto } from './dto/signup.dto';
import { BaseException } from '@common/exceptions/base.exception';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';
import { DeletedUserRepository } from '../users/deleted-user/repo/deleted-user.repo';
import { checkRecentlyDeletedConflict } from '@common/functions/check-unique';
import {
  generateVerifyCode,
  calculateEuclideanDistance,
} from '@common/functions/function';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import {
  deleteAccountMessage,
  emailNotFoundMessage,
  forgotPasswordMessage,
  googleSignInMessage,
  signupVerifyMessage,
} from '@common/constants/emial.messages';
import { VerifySignupDto } from './dto/verify.dto';
import { genSalt, hash, compare } from 'bcrypt';
import {
  FORGOT_PASSWORD_IDENTIFIER_TYPE,
  GENDER,
  IDENTIFIER_TYPE,
  LANGUAGE,
  PROVIDER,
  TOKEN_TYPE,
} from '@common/constants/common.enum';
import { lastValueFrom } from 'rxjs';
import { GoogleAuthloginDto, LoginDto } from './dto/login.dto';
import { IReturnedUser } from '../users/user/interface/user.interface';
import { BannedUserRepository } from '../users/banned-user/repo/banned-user.repo';
import { OAuth2Client } from 'google-auth-library';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as crypto from 'crypto';
import { TokenService } from '../tokens/token/token.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { DeleteAccountDto, RemoveAccountDto } from './dto/delete-account.dto';
import { DeletionOrchestorRepository } from '../orchestrators/deletion-orchestrator/repo/deletion-orchestor.repo';
import i18n from '@/src/i18n';
import { FaceDescriptorDto } from './dto/face-descriptor.dto';
import { decryptPayload, encryptPayload } from '@/src/common/functions/crypto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @Inject('NOTIFICATION_SERVICE_KAFKA')
    private readonly notificationServiceKafka: ClientKafka,

    @Inject('ACCOUNT_SERVICE_TCP')
    private readonly accountServiceTcp: ClientProxy,

    @Inject('ACCOUNT_SERVICE_KAFKA')
    private readonly accountServiceKafka: ClientKafka,

    @Inject('RELATIONSHIP_SERVICE_KAFKA')
    private readonly relationshipServiceKafka: ClientKafka,

    private readonly config: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly bannedUserRepo: BannedUserRepository,
    private readonly deletedUserRepo: DeletedUserRepository,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService,
    private readonly deletionOrchestorRepo: DeletionOrchestorRepository,
  ) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(clientId);
  }

  async onModuleInit() {
    await Promise.all([
      this.notificationServiceKafka.connect(),
      this.accountServiceKafka.connect(),
      this.relationshipServiceKafka.connect(),
    ]);
  }

  private sendEmail(to: string, subject: string, html: string): void {
    this.notificationServiceKafka.emit('mail.send', {
      from: '"Connectfy Team" <connectfy.team@gmail.com>',
      sender: 'Connectfy Team',
      to,
      subject,
      html,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    return hashedPassword;
  }

  private setAvatar(gender: GENDER, username: string): string {
    let avatar: string;

    switch (gender) {
      case GENDER.MALE:
        avatar = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        break;
      case GENDER.FEMALE:
        avatar = `https://avatar.iran.liara.run/public/girl?username=${username}`;
        break;
      default:
        avatar = `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUy9s7L2aRDadM1KxmVNkNQ9Edar2APzIeHw&s`;
        break;
    }

    return avatar;
  }

  async signup(
    data: SignupDto,
  ): Promise<{ unverifiedUser: Record<string, any>; verifyCode: string }> {
    const { firstName, lastName, email, username, _lang } = data;

    const userWithUsername = await this.userRepo.findOne({ username });
    const deletedUsersWithUsername = await this.deletedUserRepo.findMany({
      username,
    });

    checkRecentlyDeletedConflict({
      user: userWithUsername,
      deletedUsers: deletedUsersWithUsername,
      value: username,
      _lang,
    });

    const userWithEmail = await this.userRepo.findOne({ email });
    const deletedUsersWithEmail = await this.deletedUserRepo.findMany({
      email,
    });
    checkRecentlyDeletedConflict({
      user: userWithEmail,
      deletedUsers: deletedUsersWithEmail,
      value: email,
      _lang,
    });

    const verifyCode = generateVerifyCode();

    this.sendEmail(
      email,
      i18n.t('email_messages.signup_verify.mail_subject', { lang: _lang }),
      signupVerifyMessage(firstName, lastName, verifyCode, _lang),
    );

    return {
      unverifiedUser: data,
      verifyCode,
    };
  }

  async verifySignup(
    data: VerifySignupDto,
  ): Promise<{ _id: string; access_token?: string }> {
    const { code, verifyCode, unverifiedUser, _lang } = data;

    if (verifyCode !== code)
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const { password, ...otherDatas } = unverifiedUser;
    const { firstName, lastName, birthdayDate, gender, ...authDatas } =
      otherDatas;

    const hashedPassword = await this.hashPassword(password);

    const { _id, username } = await this.userRepo.create({
      ...authDatas,
      provider: PROVIDER.PASSWORD,
      password: hashedPassword,
    });

    const avatar = this.setAvatar(gender, username);

    await lastValueFrom(
      this.accountServiceTcp.send('account/create', {
        userId: _id,
        firstName,
        lastName,
        gender,
        avatar,
        _lang,
      }),
    );

    await lastValueFrom(
      this.accountServiceTcp.send('privacy-settings/create', {
        userId: _id,
        _lang,
      }),
    );

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({ _id });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: _id,
    });

    return { _id, access_token };
  }

  async login(data: LoginDto): Promise<{ access_token?: string }> {
    const { identifierType, identifier, password, _lang } = data;

    let isValid: boolean = true;
    let user: IReturnedUser | null;

    switch (identifierType) {
      case IDENTIFIER_TYPE.EMAIL:
        user = await this.userRepo.findOne({ email: identifier });
        break;

      case IDENTIFIER_TYPE.USERNAME:
        user = await this.userRepo.findOne({ username: identifier });
        break;

      case IDENTIFIER_TYPE.FACE_DESCRIPTOR:
        user = await this.userRepo.findOne({ username: identifier });
        break;

      default:
        user = await this.userRepo.findOne({
          'phoneNumber.fullPhoneNumber': identifier,
        });
        break;
    }

    if (!user || user.provider !== PROVIDER.PASSWORD) isValid = false;

    if (isValid && identifierType !== IDENTIFIER_TYPE.FACE_DESCRIPTOR) {
      const isPasswordMatch = await compare(
        password.toString(),
        user?.password as string,
      );

      if (!isPasswordMatch) isValid = false;
    } else if (isValid) {
      if (!user?.faceDescriptor || !Array.isArray(password)) isValid = false;
      else {
        const decryptedDescriptor = decryptPayload(
          user?.faceDescriptor,
          this.config.get<string>('FACE_DESCRIPTOR_KEY')!,
        );

        // const descriptor: number[] = JSON.parse(decryptedDescriptor);

        // const storedDescriptor: number[] = Array.isArray(descriptor)
        //   ? descriptor
        //   : JSON.parse(descriptor);

        const storedDescriptor: number[] = decryptedDescriptor
          .split(',')
          .map((num) => parseFloat(num.trim()));

        if (storedDescriptor.length !== password.length) isValid = false;
        else {
          const distance = calculateEuclideanDistance(
            password,
            storedDescriptor,
          );

          const THRESOLD = 0.6;

          if (distance > THRESOLD) isValid = false;
        }
      }
    }

    if (!isValid)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const isUserBanned = await this.bannedUserRepo.findOne({
      userId: user?._id,
    });

    if (isUserBanned)
      throw new BaseException(
        ExceptionMessages.BANNED_MESSAGE(
          isUserBanned.bannedToDate as Date,
          _lang,
        ),
        HttpStatus.FORBIDDEN,
        ExceptionTypes.FORBIDDEN,
      );

    const { refresh_token, access_token } =
      await this.refreshTokenService.generateTokens({
        _id: user?._id as string,
      });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: user?._id as string,
    });

    return { access_token };
  }

  async googleLogin(
    data: GoogleAuthloginDto,
  ): Promise<{ access_token?: string }> {
    const { idToken, _lang } = data;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    const email = payload?.email;

    if (!email)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const user = await this.userRepo.findOne({ email });

    if (!user)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    if (user.provider !== PROVIDER.GOOGLE)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const isUserBanned = await this.bannedUserRepo.findOne({
      userId: user._id,
    });

    if (isUserBanned)
      throw new BaseException(
        ExceptionMessages.BANNED_MESSAGE(
          isUserBanned.bannedToDate as Date,
          _lang,
        ),
        HttpStatus.FORBIDDEN,
        ExceptionTypes.FORBIDDEN,
      );

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({
        _id: user._id,
      });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: user._id,
    });

    return { access_token };
  }

  async googleSignup(
    data: GoogleAuthSignupDto,
  ): Promise<{ _id: string; access_token?: string }> {
    const { idToken, username, gender, _lang } = data;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    const email = payload?.email;
    const firstName = payload?.given_name || '';
    const lastName = payload?.family_name || '';
    let avatar = payload?.picture || null;

    if (!email)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const userWithEmail = await this.userRepo.findOne({ email });
    const deletedUsersWithEmail = await this.deletedUserRepo.findMany({
      email,
    });

    checkRecentlyDeletedConflict({
      user: userWithEmail,
      deletedUsers: deletedUsersWithEmail,
      value: email,
      _lang,
    });

    const userWithUsername = await this.userRepo.findOne({ username });
    const deletedUsersWithUsername = await this.deletedUserRepo.findMany({
      username,
    });

    checkRecentlyDeletedConflict({
      user: userWithUsername,
      deletedUsers: deletedUsersWithUsername,
      value: username,
      _lang,
    });

    const { _id } = await this.userRepo.create({
      email,
      username,
      provider: PROVIDER.GOOGLE,
      password: 'signed_up_with_google',
    });

    if (!avatar) avatar = this.setAvatar(gender, username);

    await lastValueFrom(
      this.accountServiceTcp.send('account/create', {
        userId: _id,
        firstName,
        lastName,
        gender,
        avatar,
        _lang,
      }),
    );

    await lastValueFrom(
      this.accountServiceTcp.send('privacy-settings/create', {
        userId: _id,
        _lang,
      }),
    );

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({ _id });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: _id as string,
    });

    return { _id, access_token };
  }

  async updateFaceDescriptor(data: FaceDescriptorDto) {
    const { faceDescriptor, _loggedUser, _lang } = data;

    const user = await this.userRepo.findOne({ _id: _loggedUser._id });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    if (
      (user.faceDescriptor && faceDescriptor) ||
      (!user.faceDescriptor && !faceDescriptor)
    )
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const updatedFaceDescriptor = faceDescriptor
      ? encryptPayload(
          JSON.stringify(faceDescriptor),
          this.config.get<string>('FACE_DESCRIPTOR_KEY')!,
        )
      : null;

    await this.userRepo.update({
      _id: user._id,
      faceDescriptor: updatedFaceDescriptor,
    });
  }

  async forgotPassword(
    data: ForgotPasswordDto,
  ): Promise<{ statusCode: 200; email?: string }> {
    const { identifierType, identifier, _lang } = data;

    const isEmail = identifierType === FORGOT_PASSWORD_IDENTIFIER_TYPE.EMAIL;
    const user = await this.userRepo.findOne(
      isEmail
        ? { email: identifier }
        : { 'phoneNumber.fullPhoneNumber': identifier },
    );

    if (!user) {
      if (!isEmail) return { statusCode: 200 };

      this.sendEmail(
        identifier,
        i18n.t('email_messages.email_not_found.mail_subject', { lang: _lang }),
        emailNotFoundMessage(identifier, _lang),
      );

      return { statusCode: 200 };
    }

    if (user.provider !== PROVIDER.PASSWORD) {
      this.sendEmail(
        identifier,
        i18n.t('email_messages.google_sign_in.mail_subject', { lang: _lang }),
        googleSignInMessage(identifier, _lang),
      );

      return { statusCode: 200 };
    }

    const token = crypto.randomBytes(64).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.tokenService.generateToken({
      userId: user._id as string,
      token,
      type: TOKEN_TYPE.PASSWORD_RESET,
      expiresAt: tokenExpiry,
    });

    this.sendEmail(
      identifier,
      i18n.t('email_messages.forgot_password.mail_subject', { lang: _lang }),
      forgotPasswordMessage(token, _lang),
    );

    const emailParts = user.email.split('@');

    const local = emailParts[0] || '';
    const localLength = local.length;
    const domain = emailParts[0] || '';

    const email =
      local[0] + '*'.repeat(localLength - 2) + local[localLength - 1] + domain;

    return { statusCode: 200, email };
  }

  async isTokenValid(data: string): Promise<boolean> {
    const token = await this.tokenService.findToken({ query: { token: data } });
    if (!token) return false;

    const expiresAt =
      token.expiresAt instanceof Date
        ? token.expiresAt
        : new Date(token.expiresAt);
    const now = new Date();

    if (now >= expiresAt) return false;
    if (token.isUsed) return false;

    return true;
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ statusCode: 200 }> {
    const { resetToken, password, confirmPassword, _lang } = data;

    const token = await this.tokenService.findToken({
      query: {
        $and: [{ token: resetToken }, { type: TOKEN_TYPE.PASSWORD_RESET }],
      },
      populate: [{ path: 'userId', select: '-faceDescriptor' }],
    });

    const expiresAt =
      token.expiresAt instanceof Date
        ? token.expiresAt
        : new Date(token.expiresAt);
    const now = new Date();

    if (!token || now >= expiresAt || token.isUsed) {
      if (token) await this.tokenService.removeToken({ _id: token._id });
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(_lang),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }

    if (password !== confirmPassword)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(_lang),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );

    const user = token.userId as IReturnedUser;

    const isPasswordSame = await compare(password, user.password!);

    if (isPasswordSame)
      throw new BaseException(ExceptionMessages.SAME_DATA('password', _lang));

    const hashedPassword = await this.hashPassword(password);

    await Promise.all([
      this.userRepo.update({ _id: user._id!, password: hashedPassword }),
      this.tokenService.removeToken({ _id: token._id }),
    ]);

    return { statusCode: 200 };
  }

  async logout(data: LogoutDto): Promise<{ statusCode: 200 }> {
    const { _loggedUser } = data;
    const { _id } = _loggedUser;

    await this.refreshTokenService.removeTokenByUserId(_id);

    return { statusCode: 200 };
  }

  async verifyAuthToken(token: string, _lang: LANGUAGE) {
    try {
      const payload = await this.refreshTokenService.verifyToken(token, true);

      if (!payload._id)
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
          HttpStatus.UNAUTHORIZED,
          ExceptionTypes.UNAUTHORIZED,
        );

      const user = await this.userRepo.findOne({ _id: payload._id });

      if (!user)
        throw new BaseException(
          ExceptionMessages.NOT_FOUND_MESSAGE,
          HttpStatus.NOT_FOUND,
          ExceptionTypes.NOT_FOUND,
        );

      const userObj = user.toObject ? user.toObject() : user;

      const { password, ...safeUser } = userObj;

      return { status: 200, user: safeUser };
    } catch (error) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
      );
    }
  }

  async deleteAccount(data: DeleteAccountDto): Promise<{ statusCode: 200 }> {
    const { _loggedUser, _lang } = data;
    const { _id, email } = _loggedUser;

    const token = crypto.randomBytes(64).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.tokenService.generateToken({
      userId: _id,
      token,
      expiresAt: tokenExpiry,
      type: TOKEN_TYPE.DELETE_ACCOUNT,
    });

    this.sendEmail(
      email,
      i18n.t('email_messages.delete_account.mail_subject', { lang: _lang }),
      deleteAccountMessage(token, _lang),
    );

    return { statusCode: 200 };
  }

  async removeAccount(data: RemoveAccountDto): Promise<{ statusCode: 200 }> {
    const { token, _loggedUser, _lang } = data;
    const { _id } = _loggedUser;

    const deleteToken = await this.tokenService.findToken({
      query: {
        $and: [{ token }, { type: TOKEN_TYPE.DELETE_ACCOUNT }],
      },
    });

    const deleteTokenObj = deleteToken.toObject
      ? deleteToken.toObject()
      : deleteToken;

    const expiresAt =
      deleteTokenObj.expiresAt instanceof Date
        ? deleteTokenObj.expiresAt
        : new Date(deleteTokenObj.expiresAt);
    const now = new Date();

    if (!deleteTokenObj || now >= expiresAt || deleteTokenObj.isUsed) {
      if (deleteTokenObj)
        await this.tokenService.removeToken({ _id: deleteTokenObj._id });
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(_lang),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }

    const user = await this.userRepo.findOne({ _id });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const userObj = user.toObject ? user.toObject() : user;

    await Promise.all([
      this.deletedUserRepo.create({
        userId: _id,
        ...userObj,
      }),
      this.userRepo.remove(_id),
    ]);

    const newToken = crypto.randomBytes(64).toString('hex');
    const tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.deletionOrchestorRepo.create({
      userId: _id,
      email: userObj.email,
      deletionToken: newToken,
      parts: {
        account: false,
        socialLinks: false,
        privacySettings: false,
        friendships: false,
        blocklist: false,
      },
      emailSent: false,
    });

    const payload = { userId: userObj._id, deletionToken: newToken };
    this.accountServiceKafka.emit('account.deleteAccount.create', payload);
    this.accountServiceKafka.emit('account.deleteSocialLink.create', payload);
    this.accountServiceKafka.emit(
      'account.deletePrivacySetting.create',
      payload,
    );
    this.relationshipServiceKafka.emit(
      'relationship.deleteFriendship.create',
      payload,
    );
    this.relationshipServiceKafka.emit(
      'relationship.deleteBlocklist.create',
      payload,
    );

    await Promise.all([
      this.tokenService.generateToken({
        userId: _id,
        token: newToken,
        expiresAt: tokenExpiry,
        type: TOKEN_TYPE.RESTORE_ACCOUNT,
      }),
      this.tokenService.removeTokensByUserId(_id),
      this.refreshTokenService.removeTokenByUserId(_id),
    ]);

    return { statusCode: 200 };
  }

  async refreshToken(refreshToken: string, _lang: LANGUAGE) {
    const payload = await this.refreshTokenService.verifyToken(
      refreshToken,
      false,
    );

    const user = await this.userRepo.findOne({ _id: payload.user_id });

    if (!user)
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
      );

    let { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({
        userId: user._id,
      });

    await this.refreshTokenService.saveTokens({
      userId: user._id,
      refresh_token,
    });

    return {
      user_id: user._id,
      access_token,
      refresh_token,
    };
  }
}
