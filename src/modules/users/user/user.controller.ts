import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Transport } from '@nestjs/microservices';

@Controller('')
export class UserController {
  constructor(private readonly service: UserService) {}

  @MessagePattern('user/me', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async me() {
    return await this.service.me();
  }
}
