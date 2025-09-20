import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../users/user/repo/user.repo';
import { RefreshTokenService } from '../tokens/refresh-token/refresh-token.service';
import { ConfigService } from '@nestjs/config';
import { SingupDto } from './dto/signup.dto';
import { BaseException } from '@/src/common/exceptions/base.exception';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@/src/common/constants/exception.constants';
import { DeletedUserRepository } from '../users/deleted-user/repo/deleted-user.repo';
import { checkRecentlyDeletedConflict } from '@/src/common/functions/check-unique';
import { generateVerifyCode } from '@/src/common/functions/generate-codes';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly deletedUserRepo: DeletedUserRepository,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async singup(
    data: SingupDto,
  ): Promise<{ unverifiedUser: Record<string, any>; verifyCode: string }> {
    const { email, username, phoneNumber } = data;

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

    const usersWithPhoneNumber = await this.userRepo.findMany({ phoneNumber });
    if (usersWithPhoneNumber.length) {
      const deletedUsers = await this.deletedUserRepo.findMany({
        userId: { $in: usersWithPhoneNumber.map((u) => u._id) },
      });

      checkRecentlyDeletedConflict({
        users: usersWithPhoneNumber,
        deletedUsers,
        value: phoneNumber,
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

    return {
      unverifiedUser: data,
      verifyCode,
    };
  }
}
