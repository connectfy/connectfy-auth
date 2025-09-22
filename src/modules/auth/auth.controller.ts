import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifySignupDto } from './dto/verify.dto';

@Controller('')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @MessagePattern('auth/signup', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async signup(@Payload() data: SignupDto) {
    return await this.service.singup(data);
  }

  @MessagePattern('auth/verify-signup', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async verifySignup(@Payload() data: VerifySignupDto) {
    return await this.service.verifySignup(data);
  }
}
