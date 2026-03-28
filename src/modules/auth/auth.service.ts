import {
  CLS_KEYS,
  FORGOT_PASSWORD_IDENTIFIER_TYPE,
  IDENTIFIER_TYPE,
  LANGUAGE,
  PROVIDER,
  TOKEN_TYPE,
  USER_STATUS,
  BaseException,
  ExceptionMessages,
  EXPIRE_DATES,
  THEME,
  STARTUP_PAGE,
} from 'connectfy-shared';
import { generateVerifyCode } from '@/src/common/functions/function';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RefreshTokenService } from '../tokens/refresh-token/refresh-token.service';
import { GoogleAuthSignupDto, SignupDto } from './dto/signup.dto';
import { VerifySignupDto, VerifyLoginDto } from './dto/verify.dto';
import { GoogleAuthLoginDto, LoginDto } from './dto/login.dto';
import { IReturnedUser } from '../users/user/interface/user.interface';
import { OAuth2Client } from 'google-auth-library';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { ClsService } from 'nestjs-cls';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RequestHelperService } from '@/src/internal-modules/request-helper/request-helper.service';
import { NotificationsService } from '@/src/external-modules/notifications/notifications.service';
import { BcryptService } from '@/src/internal-modules/bcrypt/bcrypt.service';
import { TokenService } from '../tokens/token/token.service';
import { AccountService } from '@/src/external-modules/account/account.service';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { LogoutDto } from './dto/logout.dto';
import { BannedUserService } from '../users/banned-user/banned-user.service';
import { DeactivatedUsersService } from '../users/deactivated-users/deactivated-users.service';
import { DeletedUserService } from '../users/deleted-user/deleted-user.service';
import { RestoreAccountDto } from './dto/restore-account.dto';
import { UserService } from '../users/user/user.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private cls: ClsService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly emailService: NotificationsService,
    private readonly bcryptService: BcryptService,
    private readonly accountService: AccountService,
    private readonly requestHelperService: RequestHelperService,
    private readonly bannedUserService: BannedUserService,
    private readonly deactivatedUserService: DeactivatedUsersService,
    private readonly deletedUserService: DeletedUserService,
    private readonly userService: UserService,
  ) {
    const clientId = ENVIRONMENT_VARIABLES.GOOGLE_CLIENT_ID;
    this.googleClient = new OAuth2Client(clientId);
  }

  // =================================
  // SIGNUP
  // =================================
  async signup(
    data: SignupDto,
  ): Promise<{ unverifiedUser: Record<string, any>; verifyCode: string }> {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const { firstName, lastName, email, username } = data;

    const userWithUsername = await this.userService.existByField({
      username,
    });

    if (userWithUsername) {
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, language),
        HttpStatus.CONFLICT,
      );
    }

    const userWithEmail = await this.userService.existByField({ email });

    if (userWithEmail) {
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, language),
        HttpStatus.CONFLICT,
      );
    }

    const verifyCode = generateVerifyCode();

    this.emailService.verifySignup({
      to: email,
      language,
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
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const { code, verifyCode, unverifiedUser, deviceId, requestData } = data;

    if (verifyCode !== code)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );

    const { firstName, lastName, birthdayDate, gender, theme, ...authDatas } =
      unverifiedUser;

    const userIp =
      this.requestHelperService.extractIpFromRequestData(requestData);
    const userLocation = this.requestHelperService.getGeoLocationFromIP(userIp);

    const { _id, username } = await this.userService.create({
      ...authDatas,
      provider: PROVIDER.PASSWORD,
      timeZone: userLocation.timezone || null,
      location: `${userLocation.country ?? ''}${userLocation.city ? `, ${userLocation.city}` : ''}`,
    });

    await this.accountService.createAccountRelatedServices({
      userId: _id,
      username,
      firstName,
      lastName,
      gender,
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
  // RESEND VERIFY SIGNUP
  // =================================
  async resendSignupVerify(data: SignupDto) {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const verifyCode = generateVerifyCode();

    this.emailService.verifySignup({
      to: data.email,
      language,
      additional: {
        firstName: data.firstName,
        lastName: data.lastName,
        verifyCode,
      },
    });

    return { verifyCode };
  }

  // =================================
  // LOGIN
  // =================================
  async login(data: LoginDto): Promise<
    | {
        access_token?: string;
        refresh_token: string;
        language: LANGUAGE;
        theme: THEME;
        startupPage: STARTUP_PAGE;
      }
    | { success: true; isTwoFactorEnabled: true; code: string; userId: string }
  > {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const { identifierType, identifier, password, requestData, deviceId } =
      data;

    let user: IReturnedUser | null;

    switch (identifierType) {
      case IDENTIFIER_TYPE.EMAIL:
        user = (await this.userService.findOne({
          query: { email: identifier },
          fields: 'password email provider status isTwoFactorEnabled',
        })) as IReturnedUser;
        break;

      case IDENTIFIER_TYPE.USERNAME:
        user = (await this.userService.findOne({
          query: { username: identifier },
          fields: 'password email provider status isTwoFactorEnabled',
        })) as IReturnedUser;
        break;

      default:
        user = (await this.userService.findOne({
          query: { 'phoneNumber.fullPhoneNumber': identifier },
          fields: 'password email provider status isTwoFactorEnabled',
        })) as IReturnedUser;
        break;
    }

    if (user.provider !== PROVIDER.PASSWORD) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    const isPasswordMatch = await this.bcryptService.compare(
      password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    await this.bannedUserService.isUserBanned({ userId: user._id });

    if (
      user.status !== USER_STATUS.ACTIVE &&
      user.status !== USER_STATUS.INACTIVE
    ) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    if (user.isTwoFactorEnabled) {
      const twoFaCode = generateVerifyCode();

      const account = await this.accountService.findProfile({
        query: { userId: user._id },
        fields: 'firstName lastName',
      });

      this.emailService.twoFaEmail({
        to: user.email,
        language,
        additional: {
          firstName: account?.firstName || '',
          lastName: account?.lastName || '',
          verifyCode: twoFaCode,
        },
      });

      return {
        success: true,
        isTwoFactorEnabled: true,
        code: twoFaCode,
        userId: user._id,
      };
    }

    if (user.status === USER_STATUS.INACTIVE) {
      await this.deactivatedUserService.activateUserIfExist(user._id);
    }

    const { refresh_token, access_token } =
      await this.refreshTokenService.generateTokens({
        _id: user._id,
      });

    const generalSettings = await this.accountService.findGeneralSettings({
      query: { userId: user._id },
      fields: 'language theme startupPage',
    });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: user._id,
      deviceId,
      requestData,
    });

    return {
      access_token,
      refresh_token,
      language: generalSettings.language,
      theme: generalSettings.theme,
      startupPage: generalSettings.startupPage,
    };
  }

  // =================================
  // VERIFY LOGIN
  // =================================
  async verifyLogin(data: VerifyLoginDto) {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const { twoFaCode, code, requestData, deviceId, userId } = data;

    const user = (await this.userService.findOne({
      query: { _id: userId },
      fields: 'password provider status isTwoFactorEnabled',
    })) as IReturnedUser;

    if (!user.isTwoFactorEnabled || user.provider !== PROVIDER.PASSWORD) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    await this.bannedUserService.isUserBanned({ userId: user._id });

    if (twoFaCode !== code) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    if (user.status === USER_STATUS.INACTIVE) {
      await this.deactivatedUserService.activateUserIfExist(user._id);
    }

    const { refresh_token, access_token } =
      await this.refreshTokenService.generateTokens({
        _id: user._id,
      });

    const generalSettings = await this.accountService.findGeneralSettings({
      query: { userId: user._id },
      fields: 'language theme startupPage',
    });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: user._id,
      deviceId,
      requestData,
    });

    return {
      access_token,
      refresh_token,
      language: generalSettings.language,
      theme: generalSettings.theme,
      startupPage: generalSettings.startupPage,
    };
  }

  // =================================
  // GOOGLE LOGIN
  // =================================
  async googleLogin(data: GoogleAuthLoginDto): Promise<{
    access_token?: string;
    refresh_token: string;
    language: LANGUAGE;
    theme: THEME;
    startupPage: STARTUP_PAGE;
  }> {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const { idToken, deviceId, requestData } = data;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: ENVIRONMENT_VARIABLES.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload?.email;

    if (!email) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    const user = (await this.userService.findOne({
      query: { email },
    })) as IReturnedUser;

    if (user.provider !== PROVIDER.GOOGLE) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    await this.bannedUserService.isUserBanned({ userId: user._id });

    if (
      user.status !== USER_STATUS.ACTIVE &&
      user.status !== USER_STATUS.INACTIVE
    ) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    if (user.status === USER_STATUS.INACTIVE) {
      await this.deactivatedUserService.activateUserIfExist(user._id);
    }

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({
        _id: user._id,
      });

    const generalSettings = await this.accountService.findGeneralSettings({
      query: { userId: user._id },
      fields: 'language theme startupPage',
    });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: user._id,
      deviceId,
      requestData,
    });

    return {
      access_token,
      refresh_token,
      language: generalSettings.language,
      theme: generalSettings.theme,
      startupPage: generalSettings.startupPage,
    };
  }

  // =================================
  // GOOGLE SIGNUP
  // =================================
  async googleSignup(
    data: GoogleAuthSignupDto,
  ): Promise<{ _id: string; access_token?: string; refresh_token: string }> {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const {
      idToken,
      username,
      gender,
      theme,
      birthdayDate,
      deviceId,
      requestData,
    } = data;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: ENVIRONMENT_VARIABLES.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload?.email;
    const firstName = payload?.given_name || '';
    const lastName = payload?.family_name || '';

    if (!email)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );

    const userWithEmail = await this.userService.existByField({ email });

    if (userWithEmail) {
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, language),
        HttpStatus.CONFLICT,
      );
    }

    const userWithUsername = await this.userService.existByField({ username });

    if (userWithUsername) {
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, language),
        HttpStatus.CONFLICT,
      );
    }

    const userIp =
      this.requestHelperService.extractIpFromRequestData(requestData);
    const userLocation = this.requestHelperService.getGeoLocationFromIP(userIp);

    const { _id } = await this.userService.create({
      email,
      username,
      provider: PROVIDER.GOOGLE,
      password: await this.bcryptService.hash('signed_up_with_google'),
      timeZone: userLocation.timezone || null,
      location: `${userLocation.country ?? ''}${userLocation.city ? `, ${userLocation.city}` : ''}`,
    });

    await this.accountService.createAccountRelatedServices({
      userId: _id,
      username,
      firstName,
      lastName,
      gender,
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
  // FORGOT PASSWORD
  // =================================
  async forgotPassword(
    data: ForgotPasswordDto,
  ): Promise<{ statusCode: 200; email?: string }> {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const { identifierType, identifier } = data;

    const isEmail = identifierType === FORGOT_PASSWORD_IDENTIFIER_TYPE.EMAIL;
    const user = await this.userService.findOne(
      isEmail
        ? { query: { email: identifier } }
        : { query: { 'phoneNumber.fullPhoneNumber': identifier } },
      false,
    );

    if (!user) {
      if (!isEmail) return { statusCode: 200 };

      this.emailService.emailNotFound({ to: identifier, language });

      return { statusCode: 200 };
    }

    if (user.provider !== PROVIDER.PASSWORD) {
      this.emailService.googleSignInDetected({ to: identifier, language });

      return { statusCode: 200 };
    }

    const token = await this.tokenService.generateAndSaveJwtToken({
      userId: user._id,
      type: TOKEN_TYPE.PASSWORD_RESET,
      secret: 'FORGOT_PASSWORD_SECRET',
      jwtExp: EXPIRE_DATES.JWT.ONE_HOUR,
      tokenExp: EXPIRE_DATES.TOKEN.ONE_HOUR,
    });

    this.emailService.forgotPassword({
      to: identifier,
      language,
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
      const hashedToken = this.tokenService.hashToken(token);

      const res = await this.tokenService.findToken({
        query: { $and: [{ token: hashedToken }, { type }] },
      });

      const expiresAt = res.expiresAt ? res.expiresAt : new Date(res.expiresAt);
      const now = new Date();

      if (now >= expiresAt) return false;
      return !res.isUsed;
    } catch {
      return false;
    }
  }

  // =================================
  // RESET PASSWORD
  // =================================
  async resetPassword(data: ResetPasswordDto): Promise<{ statusCode: 200 }> {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const { resetToken, password, confirmPassword } = data;

    const hashedToken = this.tokenService.hashToken(resetToken);

    const token = await this.tokenService.findToken({
      query: {
        $and: [{ token: hashedToken }, { type: TOKEN_TYPE.PASSWORD_RESET }],
      },
      populate: [{ path: 'userId', select: '_id, password' }],
    });

    const decoded = this.jwtService.verify(resetToken, {
      secret: ENVIRONMENT_VARIABLES.FORGOT_PASSWORD_SECRET,
    });

    if (decoded.type !== TOKEN_TYPE.PASSWORD_RESET)
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE(language),
        HttpStatus.CONFLICT,
      );

    const user = token.userId as IReturnedUser;

    if (decoded.userId !== user._id)
      throw new BaseException(
        ExceptionMessages.FORBIDDEN_MESSAGE(language),
        HttpStatus.FORBIDDEN,
      );

    const now = new Date();

    if (now >= token.expiresAt || token.isUsed) {
      if (token) await this.tokenService.removeToken({ _id: token._id });

      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(language),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (password !== confirmPassword)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE(language),
        HttpStatus.BAD_REQUEST,
      );

    const isPasswordSame = await this.bcryptService.compare(
      password,
      user.password,
    );

    if (isPasswordSame)
      throw new BaseException(
        ExceptionMessages.SAME_DATA('password', language),
        HttpStatus.BAD_REQUEST,
      );

    const hashedPassword = await this.bcryptService.hash(password);

    await Promise.all([
      this.userService.edit({ _id: user._id, password: hashedPassword }),
      this.tokenService.removeToken({ _id: token._id }),
    ]);
    return { statusCode: 200 };
  }

  // =================================
  // LOGOUT
  // =================================
  async logout(data: LogoutDto): Promise<{ statusCode: 200 }> {
    const { deviceId } = data;
    const { _id } = this.cls.get<IReturnedUser>(CLS_KEYS.USER);

    const findToken = await this.refreshTokenService.findOne({
      query: {
        $and: [{ userId: _id }, { deviceId }],
      },
      fields: 'userId deviceId',
    });

    await this.refreshTokenService.removeTokenByUserId(findToken.userId);

    return { statusCode: 200 };
  }

  // =================================
  // VERIFY AUTH TOKEN
  // =================================
  async verifyAuthToken(access_token: string, refresh_token: string) {
    const payload = await this.refreshTokenService.verifyToken(access_token);
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    if (!payload._id) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(language),
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );
    }

    const storedToken = await this.refreshTokenService.findToken(refresh_token);

    if (!storedToken || storedToken.userId !== payload._id) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(language),
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );
    }

    const user = (await this.userService.findOne({
      query: { _id: payload._id },
      fields: '-password',
    })) as IReturnedUser;

    await this.bannedUserService.isUserBanned({ userId: user._id });

    const [account, generalSettings] = await Promise.all([
      this.accountService.findProfile({
        query: { userId: user._id },
        fields: 'avatar defaultAvatar',
      }),
      this.accountService.findGeneralSettings({
        query: { userId: user._id },
        fields: 'language',
      }),
    ]);

    if (!account || !generalSettings) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(language),
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );
    }

    const result = {
      ...user,
      language: generalSettings.language,
      avatar: account.avatar,
      defaultAvatar: account.defaultAvatar,
    };

    return { status: 200, user: result };
  }

  // =================================
  // REFRESH TOKEN
  // =================================
  async refreshToken(data: Record<string, any>) {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const payload = await this.refreshTokenService.verifyToken(
      data.refresh_token,
      false,
    );

    const isExpired = Date.now() >= payload.exp * 1000;

    if (isExpired) {
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(language),
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.refreshTokenService.findToken(data.refresh_token);

    const user = (await this.userService.findOne({
      query: { _id: payload._id },
    })) as IReturnedUser;

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({
        _id: user._id,
      });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: user._id,
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
    const { _id, email: userEmail } = this.cls.get<IReturnedUser>(
      CLS_KEYS.USER,
    );
    const lang = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    const user = (await this.userService.findOne({
      query: { _id },
      fields: 'provider +password',
    })) as IReturnedUser;

    if (user.provider === PROVIDER.PASSWORD) {
      if (!password) {
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(lang),
          HttpStatus.BAD_REQUEST,
        );
      }

      const isPasswordMatch = await this.bcryptService.compare(
        password,
        user.password,
      );

      if (!isPasswordMatch) {
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(lang),
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (user.provider === PROVIDER.GOOGLE) {
      if (!idToken) {
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(lang),
          HttpStatus.BAD_REQUEST,
        );
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: ENVIRONMENT_VARIABLES.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const email = payload?.email;

      if (!email || email !== userEmail) {
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(lang),
          HttpStatus.CONFLICT,
        );
      }
    }

    await this.tokenService.removeMany({
      $and: [{ userId: _id }, { type }],
    });

    const { rawToken: token } = await this.tokenService.generateAndSaveToken({
      userId: _id,
      type,
      expiresInMs: 10 * 60 * 60,
    });

    return { statusCode: 200, token };
  }

  // =================================
  // RESTORE ACCOUNT
  // =================================
  async restoreAccount(data: RestoreAccountDto) {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const { token, deviceId, requestData } = data;

    const hashedToken = this.tokenService.hashToken(token);

    const restoreToken = await this.tokenService.findToken({
      query: { token: hashedToken, type: TOKEN_TYPE.RESTORE_ACCOUNT },
    });

    if (restoreToken.expiresAt && restoreToken.expiresAt < new Date()) {
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED(language),
        HttpStatus.GONE,
      );
    }

    const decoded = this.jwtService.verify(token, {
      secret: ENVIRONMENT_VARIABLES.RESTORE_ACCOUNT_SECRET,
    });

    if (decoded.type !== TOKEN_TYPE.RESTORE_ACCOUNT)
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE(language),
        HttpStatus.CONFLICT,
      );

    if (decoded.userId !== restoreToken.userId)
      throw new BaseException(
        ExceptionMessages.FORBIDDEN_MESSAGE(language),
        HttpStatus.FORBIDDEN,
      );

    await Promise.all([
      this.tokenService.removeTokensByUserId(decoded.userId),
      this.deletedUserService.restoreAccount(decoded.userId),
    ]);

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({ _id: decoded.userId });

    const generalSettings = await this.accountService.findGeneralSettings({
      query: { userId: decoded.userId },
      fields: 'language theme startupPage',
    });

    await this.refreshTokenService.saveTokens({
      refresh_token,
      userId: decoded.userId,
      deviceId,
      requestData,
    });

    return {
      access_token,
      refresh_token,
      language: generalSettings.language,
      theme: generalSettings.theme,
      startupPage: generalSettings.startupPage,
    };
  }
}
