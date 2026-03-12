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
  DELETE_REASON,
  DELETE_REASON_CODE,
} from 'connectfy-shared';
import { generateVerifyCode } from '@/src/common/functions/function';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../users/user/repo/user.repo';
import { RefreshTokenService } from '../tokens/refresh-token/refresh-token.service';
import { GoogleAuthSignupDto, SignupDto } from './dto/signup.dto';
import { DeletedUserRepository } from '../users/deleted-user/repo/deleted-user.repo';
import { VerifySignupDto, VerifyLoginDto } from './dto/verify.dto';
import { GoogleAuthLoginDto, LoginDto } from './dto/login.dto';
import { IReturnedUser } from '../users/user/interface/user.interface';
import { BannedUserRepository } from '../users/banned-user/repo/banned-user.repo';
import { OAuth2Client } from 'google-auth-library';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { ClsService } from 'nestjs-cls';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { RestoreAccountDto } from './dto/restore-account.dto';
import { JwtService } from '@nestjs/jwt';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { DeactivatedUserRepository } from '../users/deactivated-users/repo/deactivated-user.repo';
import { RequestHelperService } from '@/src/internal-modules/request-helper/request-helper.service';
import { NotificationsService } from '@/src/external-modules/notifications/notifications.service';
import { BcryptService } from '@/src/internal-modules/bcrypt/bcrypt.service';
import { TokenService } from '../tokens/token/token.service';
import { AccountService } from '@/src/external-modules/account/account.service';
import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private cls: ClsService,
    private readonly userRepo: UserRepository,
    private readonly bannedUserRepo: BannedUserRepository,
    private readonly deletedUserRepo: DeletedUserRepository,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly deactivatedUserRepo: DeactivatedUserRepository,
    private readonly emailService: NotificationsService,
    private readonly bcryptService: BcryptService,
    private readonly accountService: AccountService,
    private readonly requestHelperService: RequestHelperService,
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

    const userWithUsername = await this.userRepo.findOne({
      query: { username },
    });

    if (userWithUsername)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, language),
        HttpStatus.CONFLICT,
      );

    const userWithEmail = await this.userRepo.findOne({ query: { email } });

    if (userWithEmail)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, language),
        HttpStatus.CONFLICT,
      );

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

    const { _id, username } = await this.userRepo.create({
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
        user = (await this.userRepo.findOne({
          query: { email: identifier },
          fields: 'password email provider status isTwoFactorEnabled',
        })) as IReturnedUser;
        break;

      case IDENTIFIER_TYPE.USERNAME:
        user = (await this.userRepo.findOne({
          query: { username: identifier },
          fields: 'password email provider status isTwoFactorEnabled',
        })) as IReturnedUser;
        break;

      default:
        user = (await this.userRepo.findOne({
          query: { 'phoneNumber.fullPhoneNumber': identifier },
          fields: 'password email provider status isTwoFactorEnabled',
        })) as IReturnedUser;
        break;
    }

    if (!user) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
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

    const isUserBanned = await this.bannedUserRepo.findOne({
      query: { userId: user._id },
    });

    if (isUserBanned) {
      throw new BaseException(
        ExceptionMessages.BANNED_MESSAGE(
          isUserBanned.bannedToDate as Date,
          language,
        ),
        HttpStatus.FORBIDDEN,
      );
    }

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

      const account = await this.accountService.findAccount({
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
      const deactivatedUser = await this.deactivatedUserRepo.findOne({
        query: { userId: user._id },
      });

      if (!deactivatedUser) {
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(language),
          HttpStatus.BAD_REQUEST,
        );
      }

      await Promise.all([
        this.userRepo.update(
          {
            _id: user._id,
          },
          {
            _id: user._id,
            status: USER_STATUS.ACTIVE,
          },
        ),
        this.deactivatedUserRepo.remove({ _id: deactivatedUser._id }),
      ]);
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

    const user = await this.userRepo.findOne({
      query: { _id: userId },
      fields: 'password provider status isTwoFactorEnabled',
    });

    if (
      !user ||
      !user.isTwoFactorEnabled ||
      user.provider !== PROVIDER.PASSWORD
    ) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    const isUserBanned = await this.bannedUserRepo.findOne({
      query: { userId: user._id },
    });

    if (isUserBanned) {
      throw new BaseException(
        ExceptionMessages.BANNED_MESSAGE(
          isUserBanned.bannedToDate as Date,
          language,
        ),
        HttpStatus.FORBIDDEN,
      );
    }

    if (twoFaCode !== code) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    if (user.status === USER_STATUS.INACTIVE) {
      const deactivatedUser = await this.deactivatedUserRepo.findOne({
        query: { userId: user._id },
      });

      if (!deactivatedUser) {
        throw new BaseException(
          ExceptionMessages.NOT_FOUND_MESSAGE(language),
          HttpStatus.NOT_FOUND,
        );
      }

      await Promise.all([
        this.userRepo.update(
          {
            _id: user._id,
          },
          {
            _id: user._id,
            status: USER_STATUS.ACTIVE,
          },
        ),
        this.deactivatedUserRepo.remove({ _id: deactivatedUser._id }),
      ]);
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

    const user = await this.userRepo.findOne({ query: { email } });

    if (!user) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    if (user.provider !== PROVIDER.GOOGLE) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );
    }

    const isUserBanned = await this.bannedUserRepo.findOne({
      query: { userId: user._id },
    });

    if (isUserBanned) {
      throw new BaseException(
        ExceptionMessages.BANNED_MESSAGE(
          isUserBanned.bannedToDate as Date,
          language,
        ),
        HttpStatus.FORBIDDEN,
      );
    }

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
      const deactivatedUser = await this.deactivatedUserRepo.findOne({
        query: { userId: user._id },
      });

      if (!deactivatedUser) {
        throw new BaseException(
          ExceptionMessages.INVALID_CREDENTIALS(language),
          HttpStatus.BAD_REQUEST,
        );
      }

      await Promise.all([
        this.userRepo.update(
          {
            _id: user._id,
          },
          {
            _id: user._id,
            status: USER_STATUS.ACTIVE,
          },
        ),
        this.deactivatedUserRepo.remove({ _id: deactivatedUser._id }),
      ]);
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
    const avatar = payload?.picture || null;

    if (!email)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.CONFLICT,
      );

    const userWithEmail = await this.userRepo.findOne({ query: { email } });

    if (userWithEmail)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(email, language),
        HttpStatus.CONFLICT,
      );

    const userWithUsername = await this.userRepo.findOne({
      query: { username },
    });

    if (userWithUsername)
      throw new BaseException(
        ExceptionMessages.ALREADY_EXISTS_MESSAGE(username, language),
        HttpStatus.CONFLICT,
      );

    const userIp =
      this.requestHelperService.extractIpFromRequestData(requestData);
    const userLocation = this.requestHelperService.getGeoLocationFromIP(userIp);

    const { _id } = await this.userRepo.create({
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
      avatar,
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
    const user = await this.userRepo.findOne(
      isEmail
        ? { query: { email: identifier } }
        : { query: { 'phoneNumber.fullPhoneNumber': identifier } },
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
      this.userRepo.update(
        { _id: user._id },
        { _id: user._id, password: hashedPassword },
      ),
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

    const user = await this.userRepo.findOne({
      query: { _id: payload._id },
      fields: '-password',
    });

    if (!user) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(language),
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );
    }

    const [account, generalSettings] = await Promise.all([
      this.accountService.findAccount({
        query: { userId: user._id },
        fields: 'avatar',
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
    };

    return { status: 200, user: result };
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

    const user = await this.userRepo.existsByField({ _id });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );

    const reasonDescription =
      data.reasonCode === DELETE_REASON_CODE.FOUND_ALTERNATIVE
        ? null
        : data.reasonDescription;

    await Promise.all([
      this.deletedUserRepo.create({
        userId: _id,
        reason: DELETE_REASON.USER_REQUEST,
        reasonCode: data.reasonCode,
        reasonDescription,
      }),
      this.tokenService.removeTokensByUserId(_id),
    ]);

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
      this.userRepo.update({ _id }, { _id, status: USER_STATUS.DELETED }),
    ]);

    this.emailService.deleteAccountCompleted({
      to: email,
      language: lang,
      additional: { token: newToken },
    });

    return { statusCode: 200 };
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

    const user = await this.userRepo.findOne({
      query: { _id: payload._id },
    });

    if (!user)
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(language),
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );

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

    const user = await this.userRepo.findOne({
      query: { _id },
      fields: 'provider +password',
    });

    if (!user) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
      );
    }

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

    const deletedUser = await this.deletedUserRepo.findOne({
      query: { userId: restoreToken.userId },
    });

    if (!deletedUser)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    const user = await this.userRepo.findOne({
      query: { _id: deletedUser.userId },
    });

    if (!user)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );

    await Promise.all([
      this.userRepo.update(
        { _id: user._id },
        { _id: user._id, status: USER_STATUS.ACTIVE },
      ),
      this.tokenService.removeTokensByUserId(user._id),
      this.deletedUserRepo.remove({ _id: deletedUser._id }),
    ]);

    const { access_token, refresh_token } =
      await this.refreshTokenService.generateTokens({ _id: user._id });

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
      this.deactivatedUserRepo.create({ userId: _id }),
      this.tokenService.removeTokensByUserId(_id),
      this.refreshTokenService.removeTokenByUserId(_id),
      this.userRepo.update({ _id }, { _id, status: USER_STATUS.INACTIVE }),
    ]);

    return { statusCode: 200 };
  }
}
