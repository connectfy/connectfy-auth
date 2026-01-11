import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable } from '@nestjs/common';
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
import { VerifySignupDto } from './dto/verify.dto';
import {
  FORGOT_PASSWORD_IDENTIFIER_TYPE,
  IDENTIFIER_TYPE,
  LANGUAGE,
  PROVIDER,
  TOKEN_TYPE,
  USER_STATUS,
} from '@/src/common/enums/enums';
import { GoogleAuthloginDto, LoginDto } from './dto/login.dto';
import { IReturnedUser, IUser } from '../users/user/interface/user.interface';
import { BannedUserRepository } from '../users/banned-user/repo/banned-user.repo';
import { OAuth2Client } from 'google-auth-library';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { FaceDescriptorDto } from './dto/face-descriptor.dto';
import { encryptPayload } from '@/src/common/functions/crypto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { ClsService } from 'nestjs-cls';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { RestoreAccountDto } from './dto/restore-account.dto';
import { JwtService } from '@nestjs/jwt';
import { IReturnedToken } from '../tokens/token/interface/token.interface';
import { IReturnedDeletedUser } from '../users/deleted-user/interface/deleted-user.interface';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { DeactivatedUserRepository } from '../users/deactivated-users/repo/deactivated-user.repo';
import { RequestHelper } from '@/src/common/helpers/request.helper';
import { EmailService } from '@/src/common/services/utils/email.service';
import { BcryptService } from '@/src/common/services/utils/bcrypt.service';
import { TokenService } from '../tokens/token/token.service';
import { ENV, EXPIRE_DATES } from '@/src/common/constants/constants';
import { AccountService } from '@/src/common/services/projects/account.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private cls: ClsService,
    private readonly config: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly bannedUserRepo: BannedUserRepository,
    private readonly deletedUserRepo: DeletedUserRepository,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly deactivatedUserRepo: DeactivatedUserRepository,
    private readonly emailService: EmailService,
    private readonly bcryptService: BcryptService,
    private readonly accountService: AccountService,
  ) {
    const clientId = this.config.get<string>(ENV.OAUTH.GOOGLE.CLIENT_ID);
    this.googleClient = new OAuth2Client(clientId);
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

    await this.accountService.createAccountRelatedServices({
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
      audience: this.config.get<string>(ENV.OAUTH.GOOGLE.CLIENT_ID),
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
      audience: this.config.get<string>(ENV.OAUTH.GOOGLE.CLIENT_ID),
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

    await this.accountService.createAccountRelatedServices({
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
          this.config.get<string>(ENV.AUTH.KEYS.FACE_DESCRIPTOR)!,
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

    const token = await this.tokenService.generateAndSaveJwtToken(
      user._id,
      TOKEN_TYPE.PASSWORD_RESET,
      'FORGOT_PASSWORD_SECRET',
      EXPIRE_DATES.JWT.ONE_HOUR,
      EXPIRE_DATES.TOKEN.ONE_HOUR,
    );

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
    try {
      const { token, type } = data;
      const res = await this.tokenService.findToken({
        query: { $and: [{ token }, { type }] },
      });

      const expiresAt =
        res.expiresAt instanceof Date ? res.expiresAt : new Date(res.expiresAt);
      const now = new Date();

      if (now >= expiresAt) return false;
      if (res.isUsed) return false;

      return true;
    } catch (error) {
      return false;
    }
  }

  // =================================
  // RESET PASSWORD
  // =================================
  async resetPassword(data: ResetPasswordDto): Promise<{ statusCode: 200 }> {
    const { resetToken, password, confirmPassword, _lang } = data;

    const hashedToken = this.tokenService.hashToken(resetToken);

    const token = await this.tokenService.findToken({
      query: {
        $and: [{ token: hashedToken }, { type: TOKEN_TYPE.PASSWORD_RESET }],
      },
      populate: [{ path: 'userId', select: '-faceDescriptor' }],
    });

    const tokenObj = token.toObject ? token.toObject() : token;

    const decoded = this.jwtService.verify(resetToken, {
      secret: this.config.get<string>(ENV.AUTH.JWT.ACTIONS.FORGOT_PASSWORD),
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
      if (tokenObj) await this.tokenService.removeToken({ _id: token._id });

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
      this.tokenService.removeToken({ _id: token._id }),
    ]);

    return { statusCode: 200 };
  }

  // =================================
  // LOGOUT
  // =================================
  async logout(): Promise<{ statusCode: 200 }> {
    const { _id } = this.cls.get<IUser>('user');

    await this.refreshTokenService.removeTokenByUserId(_id);

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
      const payload = await this.refreshTokenService.verifyToken(
        access_token,
      );

      if (!payload._id) {
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
          HttpStatus.UNAUTHORIZED,
          ExceptionTypes.UNAUTHORIZED,
          { navigate: true }
        );
      }

      const storedToken =
        await this.refreshTokenService.findToken(refresh_token);

      if (!storedToken || storedToken.userId !== payload._id) {
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
          HttpStatus.UNAUTHORIZED,
          ExceptionTypes.UNAUTHORIZED,
          { navigate: true }
        );
      }

      const user = await this.userRepo.findOne({ query: { _id: payload._id } });

      if (!user) {
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE(_lang),
          HttpStatus.UNAUTHORIZED,
          ExceptionTypes.UNAUTHORIZED,
          { navigate: true }
        );
      }
      const userObj = user.toObject ? user.toObject() : user;

      const { password, ...safeUser } = userObj;
      const searchPayload = { query: { userId: safeUser._id } };

      const [account, generalSettings, notificationSettings, privacySettings] =
        await Promise.all([
          this.accountService.findAccount(searchPayload),
          this.accountService.findGeneralSettings(searchPayload),
          this.accountService.findNotificationSettings(searchPayload),
          this.accountService.findPrivacySettings(searchPayload),
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
  }

  // =================================
  // DELETE ACCOUNT
  // =================================
  async deleteAccount(data: DeleteAccountDto): Promise<{ statusCode: 200 }> {
    const { token } = data;
    const { _id, email } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    const deleteToken = await this.tokenService.findToken({
      query: {
        $and: [{ token }, { userId: _id }, { type: TOKEN_TYPE.DELETE_ACCOUNT }],
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

    if (!deleteTokenObj || now >= expiresAt) {
      if (deleteTokenObj) {
        await this.tokenService.removeToken({ _id: deleteTokenObj._id });
      }
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(lang),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }

    const user = await this.userRepo.existsByField({ _id });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    await Promise.all([
      this.deletedUserRepo.create({
        userId: _id,
        reason: data.reason,
        otherReason: data.otherReason,
      }),
      this.tokenService.removeTokensByUserId(_id),
    ]);

    const [newToken, , ,] = await Promise.all([
      this.tokenService.generateAndSaveJwtToken(
        _id,
        TOKEN_TYPE.RESTORE_ACCOUNT,
        'RESTORE_ACCOUNT_SECRET',
        EXPIRE_DATES.JWT.ONE_MONTH,
        EXPIRE_DATES.TOKEN.ONE_MONTH,
      ),
      this.tokenService.removeMany({
        $and: [{ userId: _id }, { type: { $ne: TOKEN_TYPE.RESTORE_ACCOUNT } }],
      }),
      this.refreshTokenService.removeTokenByUserId(_id),
      this.userRepo.update({ _id, status: USER_STATUS.DELETED }),
    ]);

    this.emailService.deleteAccountCompleted({
      to: email,
      _lang: lang,
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
    const { _id, email: userEmail } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    const user = await this.userRepo.findOne({ query: { _id } });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );

    const userObj: IReturnedUser = user.toObject ? user.toObject() : user;

    if (userObj.provider === PROVIDER.PASSWORD) {
      if (!password)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(lang),
          HttpStatus.BAD_REQUEST,
        );

      const isPasswordMatch = await this.bcryptService.compare(
        password,
        userObj.password,
      );

      if (!isPasswordMatch)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(lang),
          HttpStatus.BAD_REQUEST,
        );
    }

    if (userObj.provider === PROVIDER.GOOGLE) {
      if (!idToken)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(lang),
          HttpStatus.BAD_REQUEST,
        );

      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.config.get<string>(ENV.OAUTH.GOOGLE.CLIENT_ID),
      });

      const payload = ticket.getPayload();

      const email = payload?.email;

      if (!email || email !== userEmail)
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(lang),
          HttpStatus.CONFLICT,
          ExceptionTypes.CONFLICT,
        );
    }

    const { rawToken: token } = await this.tokenService.generateAndSaveToken(
      _id,
      type,
      10 * 60 * 60,
    );

    return { statusCode: 200, token };
  }

  // =================================
  // RESTORE ACCOUNT
  // =================================
  async restoreAccount(data: RestoreAccountDto) {
    const { token, _lang } = data;

    const hashedToken = this.tokenService.hashToken(token);

    const restoreTokenDoc = await this.tokenService.findToken({
      query: { token: hashedToken, type: TOKEN_TYPE.RESTORE_ACCOUNT },
    });

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
      secret: this.config.get<string>(ENV.AUTH.JWT.ACTIONS.RESTORE_ACCOUNT),
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
      this.tokenService.removeTokensByUserId(userObj._id),
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
    const { _id } = this.cls.get<IUser>('user');
    const lang = this.cls.get<LANGUAGE>('lang');

    const deactivateTokenDoc = await this.tokenService.findToken({
      query: {
        $and: [
          { token },
          { userId: _id },
          { type: TOKEN_TYPE.DEACTIVATE_ACCOUNT },
        ],
      },
    });

    const deactivateToken: IReturnedToken = deactivateTokenDoc.toObject
      ? deactivateTokenDoc.toObject()
      : deactivateTokenDoc;

    if (deactivateToken.expiresAt && deactivateToken.expiresAt < new Date()) {
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(lang),
        HttpStatus.GONE,
      );
    }

    await Promise.all([
      this.deactivatedUserRepo.create({ userId: _id }),
      this.tokenService.removeTokensByUserId(_id),
      this.refreshTokenService.removeTokenByUserId(_id),
      this.userRepo.update({ _id, status: USER_STATUS.INACTIVE }),
    ]);

    return { statusCode: 200 };
  }
}
