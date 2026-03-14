import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto, VerifyEmailChangeDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';
import { CheckUniqueDto } from './dto/check-unique.dto';
import { TwoFactorDto } from './dto/two-factor.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { RestoreAccountDto } from '../../auth/dto/restore-account.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';

@Controller('')
export class UserController {
  constructor(private readonly service: UserService) {}

  @MessagePattern('user/change-username', Transport.TCP)
  async changeUsername(@Payload() data: ChangeUsernameDto) {
    return this.service.changeUsername(data);
  }

  @MessagePattern('user/change-email', Transport.TCP)
  async changeEmail(@Payload() data: ChangeEmailDto) {
    return this.service.changeEmail(data);
  }

  @MessagePattern('user/change-email/verify', Transport.TCP)
  async verifyEmailChange(@Payload() data: VerifyEmailChangeDto) {
    return this.service.verifyEmailChange(data);
  }

  @MessagePattern('user/change-password', Transport.TCP)
  async changePassword(@Payload() data: ChangePasswordDto) {
    return this.service.changePassword(data);
  }

  @MessagePattern('user/change-phone-number', Transport.TCP)
  async changePhoneNumber(@Payload() data: ChangePhoneNumberDto) {
    return this.service.changePhoneNumber(data);
  }

  @MessagePattern('user/check-unique', Transport.TCP)
  async checkUnique(@Payload() data: CheckUniqueDto) {
    return this.service.checkUnique(data);
  }

  @MessagePattern('user/two-factor', Transport.TCP)
  async updateTwoFactorAuth(@Payload() data: TwoFactorDto) {
    return this.service.updateTwoFactorAuth(data);
  }

  @MessagePattern('user/delete-account', Transport.TCP)
  async deleteAccount(@Payload() data: DeleteAccountDto) {
    return this.service.deleteAccount(data);
  }

  @MessagePattern('user/deactivate-account', Transport.TCP)
  async deactivateAccount(@Payload() data: DeactivateAccountDto) {
    return this.service.deactivateAccount(data);
  }
}
