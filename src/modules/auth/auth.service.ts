import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../users/user/repo/user.repo';
import { RefreshTokenService } from '../tokens/refresh-token/refresh-token.service';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';
import { BaseException } from '@/src/common/exceptions/base.exception';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@/src/common/constants/exception.constants';
import { DeletedUserRepository } from '../users/deleted-user/repo/deleted-user.repo';
import { checkRecentlyDeletedConflict } from '@/src/common/functions/check-unique';
import { generateVerifyCode } from '@/src/common/functions/generate-codes';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { signupVerifyMessage } from '@/src/common/constants/emial.messages';
import { VerifySignupDto } from './dto/verify.dto';
import { genSalt, hash } from 'bcrypt';
import { GENDER, PROVIDER } from '@/src/common/constants/common.enum';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('NOTIFICATION_SERVICE_KAFKA')
    private readonly notificationServiceKafka: ClientKafka,

    @Inject('ACCOUNT_SETTINGS_TCP')
    private readonly accountServiceTcp: ClientProxy,

    private readonly config: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly deletedUserRepo: DeletedUserRepository,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async onModuleInit() {
    await this.notificationServiceKafka.connect();
  }

  async singup(
    data: SignupDto,
  ): Promise<{ unverifiedUser: Record<string, any>; verifyCode: string }> {
    const { firstName, lastName, email, username, phoneNumber } = data;

    const usersWithEmail = await this.userRepo.findMany({ email });
    if (usersWithEmail.length) {
      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: usersWithEmail.map((u) => u._id) },
      });

      checkRecentlyDeletedConflict({
        users: usersWithEmail,
        deletedUsers,
        value: email,
      });
    }

    const usersWithPhoneNumber = await this.userRepo.findMany({
      'phoneNumber.fullPhoneNumber': phoneNumber.fullPhoneNumber,
    });
    if (usersWithPhoneNumber.length) {
      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: usersWithPhoneNumber.map((u) => u._id) },
      });

      checkRecentlyDeletedConflict({
        users: usersWithPhoneNumber,
        deletedUsers,
        value: `(${phoneNumber.countryCode}) ${phoneNumber.number}`,
      });
    }

    const usersWithUsername = await this.userRepo.findMany({ username });
    if (usersWithUsername.length) {
      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: usersWithUsername.map((u) => u._id) },
      });

      checkRecentlyDeletedConflict({
        users: usersWithUsername,
        deletedUsers,
        value: username,
      });
    }

    const verifyCode = generateVerifyCode();

    this.notificationServiceKafka.emit('mail.send', {
      from: '"Connectfy Team" <connectfy.team@gmail.com>',
      sender: 'Connectfy Team',
      to: email,
      subject: 'Verify your account',
      html: signupVerifyMessage(firstName, lastName, verifyCode),
    });

    return {
      unverifiedUser: data,
      verifyCode,
    };
  }

  async verifySignup(data: VerifySignupDto) {
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

    let avatar: string | null;
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

    return { _id, ...tokens };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    return hashedPassword;
  }
}
