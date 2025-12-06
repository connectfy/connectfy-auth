import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto, VerifyEmailChangeDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';

@Controller('')
export class UserController {
  constructor(private readonly service: UserService) {}

  @MessagePattern('user/me', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async me() {
    return await this.service.me();
  }

  @MessagePattern('user/change-username', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changeUsername(@Payload() data: ChangeUsernameDto) {
    return await this.service.changeUsername(data);
  }

  @MessagePattern('user/change-email', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changeEmail(@Payload() data: ChangeEmailDto) {
    return await this.service.changeEmail(data);
  }

  @MessagePattern('user/change-email/verify', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async verifyEmailChange(@Payload() data: VerifyEmailChangeDto) {
    return await this.service.verifyEmailChange(data);
  }

  @MessagePattern('user/change-password', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changePassword(@Payload() data: ChangePasswordDto) {
    return await this.service.changePassword(data);
  }

  @MessagePattern('user/change-phone-number', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changePhoneNumber(@Payload() data: ChangePhoneNumberDto) {
    return await this.service.changePhoneNumber(data);
  }
}
