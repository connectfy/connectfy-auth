import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { FindUserDto } from './dto/find.user.dto';

@Controller('')
export class UserController {
  constructor(private readonly service: UserService) {}

  @MessagePattern('user/me', Transport.TCP)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async me(@Payload() data: FindUserDto) {
    return await this.service.me(data);
  }
}
