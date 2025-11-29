import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  @MessagePattern('user/change-password', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changePassword(@Payload() data: ChangePasswordDto) {
    return await this.service.changePassword(data);
  }
}
