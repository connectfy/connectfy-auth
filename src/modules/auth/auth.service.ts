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
import {
  checkActiveUserConflict,
  checkRecentlyDeletedConflict,
} from '@common/functions/check-unique';
import { generateVerifyCode } from '@common/functions/generate-codes';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import {
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

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @Inject('NOTIFICATION_SERVICE_KAFKA')
    private readonly notificationServiceKafka: ClientKafka,

    @Inject('ACCOUNT_SETTINGS_TCP')
    private readonly accountServiceTcp: ClientProxy,

    private readonly config: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly bannedUserRepo: BannedUserRepository,
    private readonly deletedUserRepo: DeletedUserRepository,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService,
  ) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(clientId);
  }

  async onModuleInit() {
    await this.notificationServiceKafka.connect();
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

  async singup(
    data: SignupDto,
  ): Promise<{ unverifiedUser: Record<string, any>; verifyCode: string }> {
    const { firstName, lastName, email, username, phoneNumber } = data;

    const usersWithEmail = await this.userRepo.findMany({ email });
    if (usersWithEmail.length) {
      const userIds = usersWithEmail.map((u) => u._id);

      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: userIds },
      });

      checkRecentlyDeletedConflict({
        users: usersWithEmail,
        deletedUsers,
        value: email,
      });

      checkActiveUserConflict({
        userIds,
        deletedUsers,
        value: email,
      });
    }

    const usersWithPhoneNumber = await this.userRepo.findMany({
      'phoneNumber.fullPhoneNumber': phoneNumber.fullPhoneNumber,
    });
    if (usersWithPhoneNumber.length) {
      const userIds = usersWithPhoneNumber.map((u) => u._id);

      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: userIds },
      });

      checkRecentlyDeletedConflict({
        users: usersWithPhoneNumber,
        deletedUsers,
        value: `(${phoneNumber.countryCode}) ${phoneNumber.number}`,
      });

      checkActiveUserConflict({
        userIds,
        deletedUsers,
        value: `(${phoneNumber.countryCode}) ${phoneNumber.number}`,
      });
    }

    const usersWithUsername = await this.userRepo.findMany({ username });
    if (usersWithUsername.length) {
      const userIds = usersWithUsername.map((u) => u._id);

      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: userIds },
      });

      checkRecentlyDeletedConflict({
        users: usersWithUsername,
        deletedUsers,
        value: username,
      });

      checkActiveUserConflict({
        userIds,
        deletedUsers,
        value: username,
      });
    }

    const verifyCode = generateVerifyCode();

    this.sendEmail(
      email,
      'Verify your account',
      signupVerifyMessage(firstName, lastName, verifyCode),
    );

    return {
      unverifiedUser: data,
      verifyCode,
    };
  }

  async verifySignup(
    data: VerifySignupDto,
  ): Promise<{ _id: string; refresh_token: string; access_token?: string }> {
    const { code, verifyCode, unverifiedUser } = data;

    if (verifyCode !== code)
      throw new BaseException(
        ExceptionMessages.CONFLICT_MESSAGE,
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
      }),
    );

    await lastValueFrom(
      this.accountServiceTcp.send('privacy-settings/create', {
        userId: _id,
      }),
    );

    const tokens = await this.refreshTokenService.generateTokens({ _id });

    await this.refreshTokenService.saveTokens({
      refresh_token: tokens.refresh_token,
      userId: _id,
    });

    return { _id, ...tokens };
  }

  async login(
    data: LoginDto,
  ): Promise<{ refresh_token: string; access_token?: string }> {
    const { identifierType, identifier, password } = data;

    let user: IReturnedUser | null;

    switch (identifierType) {
      case IDENTIFIER_TYPE.EMAIL:
        user = await this.userRepo.findOne({ email: identifier });
        break;

      case IDENTIFIER_TYPE.USERNAME:
        user = await this.userRepo.findOne({ username: identifier });
        break;

      default:
        user = await this.userRepo.findOne({
          'phoneNumber.fullPhoneNumber': identifier,
        });
        break;
    }

    if (!user)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS,
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    if (user.provider !== PROVIDER.PASSWORD)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS,
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const isPasswordMatch = await compare(password, user.password as string);

    if (!isPasswordMatch)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS,
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const isUserBanned = await this.bannedUserRepo.findOne({
      userId: user._id,
    });

    if (isUserBanned)
      throw new BaseException(
        ExceptionMessages.BANNED_MESSAGE(isUserBanned.bannedToDate as Date),
        HttpStatus.FORBIDDEN,
        ExceptionMessages.FORBIDDEN_MESSAGE,
      );

    const tokens = await this.refreshTokenService.generateTokens({
      _id: user._id as string,
    });

    await this.refreshTokenService.saveTokens({
      refresh_token: tokens.refresh_token,
      userId: user._id as string,
    });

    return tokens;
  }

  async googleLogin(
    data: GoogleAuthloginDto,
  ): Promise<{ refresh_token: string; access_token?: string }> {
    const { idToken } = data;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    const email = payload?.email;

    if (!email)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS,
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const user = await this.userRepo.findOne({ email });

    if (!user)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS,
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    if (user.provider !== PROVIDER.GOOGLE)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS,
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const isUserBanned = await this.bannedUserRepo.findOne({
      userId: user._id,
    });

    if (isUserBanned)
      throw new BaseException(
        ExceptionMessages.BANNED_MESSAGE(isUserBanned.bannedToDate as Date),
        HttpStatus.FORBIDDEN,
        ExceptionMessages.FORBIDDEN_MESSAGE,
      );

    const tokens = await this.refreshTokenService.generateTokens({
      _id: user._id,
    });

    await this.refreshTokenService.saveTokens({
      refresh_token: tokens.refresh_token,
      userId: user._id,
    });

    return tokens;
  }

  async googleSignup(
    data: GoogleAuthSignupDto,
  ): Promise<{ _id: string; refresh_token: string; access_token?: string }> {
    const { idToken, firstName, lastName, username, phoneNumber, gender } =
      data;

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    const email = payload?.email;

    if (!email)
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS,
        HttpStatus.CONFLICT,
        ExceptionTypes.CONFLICT,
      );

    const usersWithEmail = await this.userRepo.findMany({ email });
    if (usersWithEmail.length) {
      const userIds = usersWithEmail.map((u) => u._id);

      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: userIds },
      });

      checkRecentlyDeletedConflict({
        users: usersWithEmail,
        deletedUsers,
        value: email,
      });

      checkActiveUserConflict({
        userIds,
        deletedUsers,
        value: email,
      });
    }

    const usersWithPhoneNumber = await this.userRepo.findMany({
      'phoneNumber.fullPhoneNumber': phoneNumber.fullPhoneNumber,
    });
    if (usersWithPhoneNumber.length) {
      const userIds = usersWithPhoneNumber.map((u) => u._id);

      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: userIds },
      });

      checkRecentlyDeletedConflict({
        users: usersWithPhoneNumber,
        deletedUsers,
        value: `(${phoneNumber.countryCode}) ${phoneNumber.number}`,
      });

      checkActiveUserConflict({
        userIds,
        deletedUsers,
        value: `(${phoneNumber.countryCode}) ${phoneNumber.number}`,
      });
    }

    const usersWithUsername = await this.userRepo.findMany({ username });
    if (usersWithUsername.length) {
      const userIds = usersWithUsername.map((u) => u._id);

      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: userIds },
      });

      checkRecentlyDeletedConflict({
        users: usersWithUsername,
        deletedUsers,
        value: username,
      });

      checkActiveUserConflict({
        userIds,
        deletedUsers,
        value: username,
      });
    }

    const { _id } = await this.userRepo.create({
      email,
      username,
      phoneNumber,
      provider: PROVIDER.GOOGLE,
      password: 'signed_up_with_google',
    });

    const avatar = this.setAvatar(gender, username);

    await lastValueFrom(
      this.accountServiceTcp.send('account/create', {
        userId: _id,
        firstName,
        lastName,
        gender,
        avatar,
      }),
    );

    await lastValueFrom(
      this.accountServiceTcp.send('privacy-settings/create', {
        userId: _id,
      }),
    );

    const tokens = await this.refreshTokenService.generateTokens({ _id });

    await this.refreshTokenService.saveTokens({
      refresh_token: tokens.refresh_token,
      userId: _id as string,
    });

    return { _id, ...tokens };
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ statusCode: 200 }> {
    const { identifierType, identifier } = data;

    const isEmail = identifierType === FORGOT_PASSWORD_IDENTIFIER_TYPE.EMAIL;
    const user = await this.userRepo.findOne(
      isEmail
        ? { email: identifier }
        : { 'phoneNumber.fullPhoneNumber': identifier },
    );

    if (!user) {
      this.sendEmail(
        identifier,
        'Password Reset - Account Not Found',
        emailNotFoundMessage(identifier),
      );
    } else if (user.provider !== PROVIDER.PASSWORD) {
      this.sendEmail(
        identifier,
        'Password Reset - Google Sign In Detected',
        googleSignInMessage(identifier),
      );
    } else {
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
        'Password Reset',
        forgotPasswordMessage(token),
      );
    }

    return { statusCode: 200 };
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
    const { resetToken, password, confirmPassword } = data;

    const token = await this.tokenService.findToken({
      query: { token: resetToken },
      populate: [{ path: 'userId', select: '-faceDescriptor' }],
    });

    const expiresAt =
      token.expiresAt instanceof Date
        ? token.expiresAt
        : new Date(token.expiresAt);
    const now = new Date();

    if (!token || now >= expiresAt || token.isUsed)
      throw new BaseException(
        ExceptionMessages.TOKEN_EXPIRED,
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );

    if (password !== confirmPassword)
      throw new BaseException(
        ExceptionMessages.BAD_REQUEST_MESSAGE,
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );

    const user = token.userId as IReturnedUser;

    const isPasswordSame = await compare(password, user.password!);

    if (isPasswordSame)
      throw new BaseException(ExceptionMessages.SAME_DATA('password'));

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

  async verifyAuthToken(token: string) {
    try {
      const payload = await this.refreshTokenService.verifyToken(token, true);

      if (!payload._id)
        throw new BaseException(
          ExceptionMessages.UNAUTHORIZED_MESSAGE,
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

      const { password, faceDescriptor, ...safeUser } = userObj;

      return { status: 200, user: safeUser };
    } catch (error) {
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE,
        HttpStatus.UNAUTHORIZED,
        ExceptionTypes.UNAUTHORIZED,
      );
    }
  }
}
