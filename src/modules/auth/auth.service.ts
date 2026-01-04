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
import { generateVerifyCode } from '@common/functions/function';
import { ClientProxy } from '@nestjs/microservices';
import { VerifySignupDto } from './dto/verify.dto';
import {
  FORGOT_PASSWORD_IDENTIFIER_TYPE,
  GENDER,
  IDENTIFIER_TYPE,
  LANGUAGE,
  PROVIDER,
  TOKEN_TYPE,
  USER_STATUS,
} from '@common/constants/common.enum';
import { GoogleAuthloginDto, LoginDto } from './dto/login.dto';
import { IReturnedUser } from '../users/user/interface/user.interface';
import { BannedUserRepository } from '../users/banned-user/repo/banned-user.repo';
import { OAuth2Client } from 'google-auth-library';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { FaceDescriptorDto } from './dto/face-descriptor.dto';
import { encryptPayload } from '@/src/common/functions/crypto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { ClsService } from 'nestjs-cls';
import { ILoggedUser } from '@/src/common/interfaces/request.interface';
import { sendWithContext } from '@/src/common/helpers/microservice-request.helper';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { TokenRepository } from '../tokens/token/repo/token.repo';
import { RestoreAccountDto } from './dto/restore-account.dto';
import { JwtService } from '@nestjs/jwt';
import { IReturnedToken } from '../tokens/token/interface/token.interface';
import { IReturnedDeletedUser } from '../users/deleted-user/interface/deleted-user.interface';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { DeactivatedUserRepository } from '../users/deactivated-users/repo/deactivated-user.repo';
import { RequestHelper } from '@/src/common/helpers/request.helper';
import { EmailService } from '@/src/common/services/email.service';
import { BcryptService } from '@/src/common/services/bcrypt.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @Inject('ACCOUNT_SERVICE_TCP')
    private readonly accountServiceTcp: ClientProxy,

    private cls: ClsService,
    private readonly config: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly bannedUserRepo: BannedUserRepository,
    private readonly deletedUserRepo: DeletedUserRepository,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenRepo: TokenRepository,
    private readonly jwtService: JwtService,
    private readonly deactivatedUserRepo: DeactivatedUserRepository,
    private readonly emailService: EmailService,
    private readonly bcryptService: BcryptService,
  ) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(clientId);
  }

  // =================================
  // CREATE USER ACCOUNT AND SETTINGS
  // =================================
  private async createAccountRelatedServices(opts: {
    userId: string;
    username: string;
    firstName?: string;
    lastName?: string;
    gender?: GENDER;
    avatar?: string | null;
    _lang: string;
    birthdayDate?: Date | null;
    theme?: string | null;
    location?: string | null;
  }) {
    const {
      userId,
      firstName = '',
      lastName = '',
      gender,
      avatar,
      _lang,
      birthdayDate,
      theme,
    } = opts;

    await Promise.all([
      // account create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'account/create',
        payload: {
          userId,
          firstName,
          lastName,
          gender,
          avatar,
          _lang,
          birthdayDate,
        },
      }),
      // privacy-settings/create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'privacy-settings/create',
        payload: { userId, _lang },
      }),
      // general-settings/create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'general-settings/create',
        payload: { userId, _lang, theme, language: _lang },
      }),
      // notification-settings/create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'notification-settings/create',
        payload: { userId, _lang },
      }),
    ]);
  }

  // =================================
  // SIGNUP
  // =================================
  async signup(
    data: SignupDto,
  ): Promise<{ unverifiedUser: Record<string, any>; verifyCode: string }> {
    const { firstName, lastName, email, username, _lang } = data;

    const userWithUsername = await this.userRepo.findOne({
      query: { username },
    });

    if (userWithUsername)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, _lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const userWithEmail = await this.userRepo.findOne({ query: { email } });

    if (userWithEmail)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, _lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const verifyCode = generateVerifyCode();

    this.emailService.verifySignup({
      to: email,
      _lang,
      additional: { firstName, lastName, verifyCode },
    });

    return {
      unverifiedUser: data,
      verifyCode,
    };
  }

  // =================================
  // VERIFY SIGNUP
  // =================================
  async verifySignup(
    data: VerifySignupDto,
  ): Promise<{ _id: string; access_token?: string; refresh_token: string }> {
    const { code, verifyCode, unverifiedUser, _lang, deviceId, requestData } =
      data;

    if (verifyCode !== code)
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const { password, ...otherDatas } = unverifiedUser;
    const { firstName, lastName, birthdayDate, gender, theme, ...authDatas } =
      otherDatas;

    const hashedPassword = await this.bcryptService.hash(password);

    const { _id, username } = await this.userRepo.create({
      ...authDatas,
      provider: PROVIDER.PASSWORD,
      password: hashedPassword,
    });

    const userIp = RequestHelper.extractIpFromRequestData(requestData);
    const userLocation = RequestHelper.getGeoLocationFromIP(userIp);

    await this.createAccountRelatedServices({
      userId: _id,
      username,
      firstName,
      lastName,
      gender,
      _lang,
      birthdayDate,
      theme,
      location: `${userLocation.country ?? ''}${userLocation.city ? `, ${userLocation.city}` : ''}`,
    });

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({ _id });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: _id,
      deviceId,
      requestData,
    });

    return { _id, access_token, refresh_token };
  }

  // =================================
  // LOGIN
  // =================================
  async login(
    data: LoginDto,
  ): Promise<{ access_token?: string; refresh_token: string }> {
    const {
      identifierType,
      identifier,
      password,
      _lang,
      requestData,
      deviceId,
    } = data;

    let user: IReturnedUser | null;

    switch (identifierType) {
      case IDENTIFIER_TYPE.EMAIL:
        user = await this.userRepo.findOne({ query: { email: identifier } });
        break;

      case IDENTIFIER_TYPE.USERNAME:
        user = await this.userRepo.findOne({ query: { username: identifier } });
        break;

      default:
        user = await this.userRepo.findOne({
          query: { 'phoneNumber.fullPhoneNumber': identifier },
        });
        break;
    }

    if (!user)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    if (user.provider !== PROVIDER.PASSWORD)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const isPasswordMatch = await this.bcryptService.compare(
      password!,
      user.password as string,
    );

    if (!isPasswordMatch)
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

    if (
      user.status !== USER_STATUS.ACTIVE &&
      user.status !== USER_STATUS.INACTIVE
    )
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    if (user.status === USER_STATUS.INACTIVE) {
      const deactivatedUser = await this.deactivatedUserRepo.findOne({
        query: { userId: user._id },
      });

      if (!deactivatedUser)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(_lang),
          HttpStatus.BAD_REQUEST,
        );

      await Promise.all([
        this.userRepo.update({
          _id: user._id,
          status: USER_STATUS.ACTIVE,
        }),
        this.deactivatedUserRepo.remove(deactivatedUser._id),
      ]);
    }

    const { refresh_token, access_token } =
      await this.refreshTokenService.generateTokens({
        _id: user._id as string,
      });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: user._id,
      deviceId,
      requestData,
    });

    return { access_token, refresh_token };
  }

  // =================================
  // GOOGLE LOGIN
  // =================================
  async googleLogin(
    data: GoogleAuthloginDto,
  ): Promise<{ access_token?: string; refresh_token: string }> {
    const { idToken, _lang, deviceId, requestData } = data;

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

    const user = await this.userRepo.findOne({ query: { email } });

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

    if (
      user.status !== USER_STATUS.ACTIVE &&
      user.status !== USER_STATUS.INACTIVE
    )
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(_lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    if (user.status === USER_STATUS.INACTIVE) {
      const deactivatedUser = await this.deactivatedUserRepo.findOne({
        query: { userId: user._id },
      });

      if (!deactivatedUser)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(_lang),
          HttpStatus.BAD_REQUEST,
        );

      await Promise.all([
        this.userRepo.update({
          _id: user._id,
          status: USER_STATUS.ACTIVE,
        }),
        this.deactivatedUserRepo.remove(deactivatedUser._id),
      ]);
    }

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({
        _id: user._id,
      });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: user._id,
      deviceId,
      requestData,
    });

    return { access_token, refresh_token };
  }

  // =================================
  // GOOGLE SIGNUP
  // =================================
  async googleSignup(
    data: GoogleAuthSignupDto,
  ): Promise<{ _id: string; access_token?: string; refresh_token: string }> {
    const {
      idToken,
      username,
      gender,
      theme,
      birthdayDate,
      _lang,
      deviceId,
      requestData,
    } = data;

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

    const userWithEmail = await this.userRepo.findOne({ query: { email } });

    if (userWithEmail)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, _lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const userWithUsername = await this.userRepo.findOne({
      query: { username },
    });

    if (userWithUsername)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, _lang),
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const { _id } = await this.userRepo.create({
      email,
      username,
      provider: PROVIDER.GOOGLE,
      password: await this.bcryptService.hash('singed_up_with_google'),
    });

    const userIp = RequestHelper.extractIpFromRequestData(requestData);
    const userLocation = RequestHelper.getGeoLocationFromIP(userIp);

    await this.createAccountRelatedServices({
      userId: _id,
      username,
      firstName,
      lastName,
      gender,
      avatar,
      _lang,
      birthdayDate,
      theme,
      location: `${userLocation.country ?? ''}${userLocation.city ? `, ${userLocation.city}` : ''}`,
    });

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({ _id });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: _id,
      deviceId,
      requestData,
    });

    return { _id, access_token, refresh_token };
  }

  // =================================
  // UPDATE FACE DESCRIPTOR
  // =================================
  async updateFaceDescriptor(data: FaceDescriptorDto) {
    const { faceDescriptor, _loggedUser, _lang } = data;

    const user = await this.userRepo.findOne({
      query: { _id: _loggedUser._id },
    });

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

  // =================================
  // FORGOT PASSWORD
  // =================================
  async forgotPassword(
    data: ForgotPasswordDto,
  ): Promise<{ statusCode: 200; email?: string }> {
    const { identifierType, identifier, _lang } = data;

    const isEmail = identifierType === FORGOT_PASSWORD_IDENTIFIER_TYPE.EMAIL;
    const user = await this.userRepo.findOne(
      isEmail
        ? { query: { email: identifier } }
        : { query: { 'phoneNumber.fullPhoneNumber': identifier } },
    );

    if (!user) {
      if (!isEmail) return { statusCode: 200 };

      this.emailService.emailNotFound({ to: identifier, _lang });

      return { statusCode: 200 };
    }

    if (user.provider !== PROVIDER.PASSWORD) {
      this.emailService.googleSignInDetected({ to: identifier, _lang });

      return { statusCode: 200 };
    }

    const token = this.jwtService.sign(
      { userId: user._id, type: TOKEN_TYPE.PASSWORD_RESET },
      {
        secret: this.config.get<string>('FORGOT_PASSWORD_SECRET'),
        expiresIn: '1h',
      },
    );

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.tokenRepo.save({
      userId: user._id as string,
      token: hashedToken,
      type: TOKEN_TYPE.PASSWORD_RESET,
      expiresAt: tokenExpiry,
    });

    this.emailService.forgotPassword({
      to: identifier,
      _lang,
      additional: { token },
    });

    const emailParts = user.email.split('@');

    const local = emailParts[0] || '';
    const localLength = local.length;
    const domain = emailParts[0] || '';

    const email =
      local[0] + '*'.repeat(localLength - 2) + local[localLength - 1] + domain;

    return { statusCode: 200, email };
  }

  // =================================
  // IS TOKEN VALID
  // =================================
  async isTokenValid(data: ValidateTokenDto): Promise<boolean> {
    const { token, type } = data;
    const res = await this.tokenRepo.findOne({
      query: { $and: [{ token }, { type }] },
    });
    if (!res) return false;

    const expiresAt =
      res.expiresAt instanceof Date ? res.expiresAt : new Date(res.expiresAt);
    const now = new Date();

    if (now >= expiresAt) return false;
    if (res.isUsed) return false;

    return true;
  }

  // =================================
  // RESET PASSWORD
  // =================================
  async resetPassword(data: ResetPasswordDto): Promise<{ statusCode: 200 }> {
    const { resetToken, password, confirmPassword, _lang } = data;

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const token = await this.tokenRepo.findOne({
      query: {
        $and: [{ token: hashedToken }, { type: TOKEN_TYPE.PASSWORD_RESET }],
      },
      populate: [{ path: 'userId', select: '-faceDescriptor' }],
    });

    if (!token)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
      );

    const tokenObj = token.toObject ? token.toObject() : token;

    const decoded = this.jwtService.verify(resetToken, {
      secret: this.config.get<string>('FORGOT_PASSWORD_SECRET'),
    });

    if (decoded.type !== TOKEN_TYPE.PASSWORD_RESET)
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE(_lang),
        HttpStatus.CONFLICT,
      );

    if (decoded.userId !== tokenObj.userId)
      throw new BaseException(
        ExceptionMessages.FORBIDDEN_MESSAGE(_lang),
        HttpStatus.FORBIDDEN,
      );

    const expiresAt =
      tokenObj.expiresAt instanceof Date
        ? tokenObj.expiresAt
        : new Date(tokenObj.expiresAt);
    const now = new Date();

    if (now >= expiresAt || tokenObj.isUsed) {
      if (tokenObj) await this.tokenRepo.remove({ _id: token._id });

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

    const isPasswordSame = await this.bcryptService.compare(
      password,
      user.password!,
    );

    if (isPasswordSame)
      throw new BaseException(
        ExceptionMessages.SAME_DATA('password', _lang),
        HttpStatus.BAD_REQUEST,
      );

    const hashedPassword = await this.bcryptService.hash(password);

    await Promise.all([
      this.userRepo.update({ _id: user._id!, password: hashedPassword }),
      this.tokenRepo.remove({ _id: token._id }),
    ]);

    return { statusCode: 200 };
  }

  // =================================
  // LOGOUT
  // =================================
  async logout(): Promise<{ statusCode: 200 }> {
    const { user } = this.cls.get<ILoggedUser>('user');

    await this.refreshTokenService.removeTokenByUserId(user._id);

    return { statusCode: 200 };
  }

  // =================================
  // VERIFY AUTH TOKEN
  // =================================
  async verifyAuthToken(
    access_token: string,
    refresh_token: string,
    _lang: LANGUAGE,
  ) {
    try {
      const payload = await this.refreshTokenService.verifyToken(
        access_token,
        true,
      );

      if (!payload._id) {
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
          HttpStatus.UNAUTHORIZED,
          ExceptionTypes.UNAUTHORIZED,
        );
      }

      const storedToken =
        await this.refreshTokenService.findToken(refresh_token);

      if (!storedToken || storedToken.userId !== payload._id) {
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
          HttpStatus.UNAUTHORIZED,
          ExceptionTypes.UNAUTHORIZED,
        );
      }

      const user = await this.userRepo.findOne({ query: { _id: payload._id } });

      if (!user) {
        throw new BaseException(
          ExceptionMessages.NOT_FOUND_MESSAGE,
          HttpStatus.NOT_FOUND,
          ExceptionTypes.NOT_FOUND,
        );
      }
      const userObj = user.toObject ? user.toObject() : user;

      const { password, ...safeUser } = userObj;

      const [account, generalSettings, notificationSettings, privacySettings] =
        await Promise.all([
          sendWithContext({
            client: this.accountServiceTcp,
            endpoint: 'account/findOne',
            payload: { query: { userId: safeUser._id } },
          }),
          sendWithContext({
            client: this.accountServiceTcp,
            endpoint: 'general-settings/findOne',
            payload: { query: { userId: safeUser._id } },
          }),
          sendWithContext({
            client: this.accountServiceTcp,
            endpoint: 'notification-settings/findOne',
            payload: { query: { userId: safeUser._id } },
          }),
          sendWithContext({
            client: this.accountServiceTcp,
            endpoint: 'privacy-settings/findOne',
            payload: { query: { userId: safeUser._id } },
          }),
        ]);

      const result = {
        user: safeUser,
        account,
        settings: {
          generalSettings,
          notificationSettings,
          privacySettings,
        },
      };

      return { status: 200, user: result };
    } catch (error) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
      );
    }
  }

  // =================================
  // DELETE ACCOUNT
  // =================================
  async deleteAccount(data: DeleteAccountDto): Promise<{ statusCode: 200 }> {
    const { token } = data;
    const { user: _loggedUser, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, email } = _loggedUser;
    const { language } = settings.generalSettings;

    const deleteToken = await this.tokenRepo.findOne({
      query: {
        $and: [{ token }, { userId: _id }, { type: TOKEN_TYPE.DELETE_ACCOUNT }],
      },
    });

    if (!deleteToken)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.BAD_REQUEST,
      );

    const deleteTokenObj = deleteToken.toObject
      ? deleteToken.toObject()
      : deleteToken;

    const expiresAt =
      deleteTokenObj.expiresAt instanceof Date
        ? deleteTokenObj.expiresAt
        : new Date(deleteTokenObj.expiresAt);
    const now = new Date();

    if (!deleteTokenObj || now >= expiresAt) {
      if (deleteTokenObj) {
        await this.tokenRepo.remove({ _id: deleteTokenObj._id });
      }
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(language),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }

    const user = await this.userRepo.existsByField({ _id });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    await Promise.all([
      this.deletedUserRepo.create({
        userId: _id,
        reason: data.reason,
        otherReason: data.otherReason,
      }),
      this.tokenRepo.removeMany({ userId: _id }),
    ]);

    const newToken = this.jwtService.sign(
      {
        userId: _id.toString(),
        type: TOKEN_TYPE.RESTORE_ACCOUNT,
      },
      {
        secret: this.config.get<string>('RESTORE_ACCOUNT_SECRET'),
        expiresIn: '30d',
      },
    );

    const hashedToken = crypto
      .createHash('sha256')
      .update(newToken)
      .digest('hex');
    const tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Promise.all([
      this.tokenRepo.save({
        userId: _id,
        token: hashedToken,
        expiresAt: tokenExpiry,
        type: TOKEN_TYPE.RESTORE_ACCOUNT,
      }),
      this.tokenRepo.removeMany({
        $and: [{ userId: _id }, { type: { $ne: TOKEN_TYPE.RESTORE_ACCOUNT } }],
      }),
      this.refreshTokenService.removeTokenByUserId(_id),
      this.userRepo.update({ _id, status: USER_STATUS.DELETED }),
    ]);

    this.emailService.deleteAccountCompleted({
      to: email,
      _lang: language,
      additional: { token: newToken },
    });

    return { statusCode: 200 };
  }

  // =================================
  // REFRESH TOKEN
  // =================================
  async refreshToken(data: Record<string, any>, _lang: LANGUAGE) {
    const payload = await this.refreshTokenService.verifyToken(
      data.refresh_token,
      false,
    );

    const user = await this.userRepo.findOne({
      query: { _id: payload._id },
    });

    if (!user)
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
      );

    const userObj = user.toObject ? user.toObject() : user;

    let { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({
        _id: userObj._id,
      });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: userObj._id,
      deviceId: data.deviceId,
      requestData: data.requestData,
    });

    return {
      user_id: user._id,
      access_token,
      refresh_token,
    };
  }

  // =================================
  // AUTHENTICATE USER
  // =================================
  async authenticateUser(
    data: AuthenticateUserDto,
  ): Promise<{ statusCode: number; token: string }> {
    const { password, type, idToken } = data;
    const { user: _loggedUser, settings } = this.cls.get<ILoggedUser>('user');
    const { _id, email: userEmail } = _loggedUser;
    const { language } = settings.generalSettings;

    const user = await this.userRepo.findOne({ query: { _id } });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    const userObj: IReturnedUser = user.toObject ? user.toObject() : user;

    if (userObj.provider === PROVIDER.PASSWORD) {
      if (!password)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(language),
          HttpStatus.BAD_REQUEST,
        );

      const isPasswordMatch = await this.bcryptService.compare(
        password,
        userObj.password,
      );

      if (!isPasswordMatch)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(language),
          HttpStatus.BAD_REQUEST,
        );
    }

    if (userObj.provider === PROVIDER.GOOGLE) {
      if (!idToken)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(language),
          HttpStatus.BAD_REQUEST,
        );

      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      const email = payload?.email;

      if (!email || email !== userEmail)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(language),
          HttpStatus.CONFLICT,
          ExceptionTypes.CONFLICT,
        );
    }

    const rawToken = crypto.randomBytes(128).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const { token } = await this.tokenRepo.save({
      userId: _id,
      token: hashedToken,
      type,
      expiresAt: tokenExpiry,
    });

    return { statusCode: 200, token };
  }

  // =================================
  // RESTORE ACCOUNT
  // =================================
  async restoreAccount(data: RestoreAccountDto) {
    const { token, _lang } = data;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const restoreTokenDoc = await this.tokenRepo.findOne({
      query: { token: hashedToken, type: TOKEN_TYPE.RESTORE_ACCOUNT },
    });

    if (!restoreTokenDoc)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
      );

    const restoreToken: IReturnedToken = restoreTokenDoc.toObject
      ? restoreTokenDoc.toObject()
      : restoreTokenDoc;

    if (restoreToken.expiresAt && restoreToken.expiresAt < new Date()) {
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(_lang),
        HttpStatus.GONE,
      );
    }

    const decoded = this.jwtService.verify(token, {
      secret: this.config.get<string>('RESTORE_ACCOUNT_SECRET'),
    });

    if (decoded.type !== TOKEN_TYPE.RESTORE_ACCOUNT)
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE(_lang),
        HttpStatus.CONFLICT,
      );

    if (decoded.userId !== restoreToken.userId)
      throw new BaseException(
        ExceptionMessages.FORBIDDEN_MESSAGE(_lang),
        HttpStatus.FORBIDDEN,
      );

    const deletedUserDoc = await this.deletedUserRepo.findOne({
      userId: restoreToken.userId,
    });

    if (!deletedUserDoc)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
      );

    const deletedUser: IReturnedDeletedUser = deletedUserDoc.toObject
      ? deletedUserDoc.toObject()
      : deletedUserDoc;

    const userDoc = await this.userRepo.findOne({
      query: { _id: deletedUser.userId },
    });

    if (!userDoc)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
      );

    const userObj: IReturnedUser = userDoc.toObject
      ? userDoc.toObject()
      : userDoc;

    await Promise.all([
      this.userRepo.update({ _id: userObj._id, status: USER_STATUS.ACTIVE }),
      this.tokenRepo.removeMany({ userId: userObj._id }),
      this.deletedUserRepo.remove(deletedUser._id),
    ]);

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({ _id: userObj._id });

    return { access_token, refresh_token };
  }

  // =================================
  // DEACTIVATE ACCOUNT
  // =================================
  async deactivateAccount(data: DeactivateAccountDto) {
    const { token } = data;
    const { user: _loggedUser, settings } = this.cls.get<ILoggedUser>('user');
    const { _id } = _loggedUser;
    const { language } = settings.generalSettings;

    const deactivateTokenDoc = await this.tokenRepo.findOne({
      query: {
        $and: [
          { token },
          { userId: _id },
          { type: TOKEN_TYPE.DEACTIVATE_ACCOUNT },
        ],
      },
    });

    if (!deactivateTokenDoc)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    const deactivateToken: IReturnedToken = deactivateTokenDoc.toObject
      ? deactivateTokenDoc.toObject()
      : deactivateTokenDoc;

    if (deactivateToken.expiresAt && deactivateToken.expiresAt < new Date()) {
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(language),
        HttpStatus.GONE,
      );
    }

    await Promise.all([
      this.deactivatedUserRepo.create({ userId: _id }),
      this.tokenRepo.removeMany({ userId: _id }),
      this.refreshTokenService.removeTokenByUserId(_id),
      this.userRepo.update({ _id, status: USER_STATUS.INACTIVE }),
    ]);

    return { statusCode: 200 };
  }
}
