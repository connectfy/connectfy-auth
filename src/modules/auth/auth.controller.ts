import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SingupDto } from './dto/signup.dto';

@Controller('')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @MessagePattern('auth/signup', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async signup(@Payload() data: SingupDto) {
    return await this.service.singup(data);
  }
}
