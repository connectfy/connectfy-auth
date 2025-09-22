import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthSignupDto, SignupDto } from './dto/signup.dto';
import { VerifySignupDto } from './dto/verify.dto';
import { GoogleAuthloginDto, LoginDto } from './dto/login.dto';
import { GOOGLE_AUTH_LOGIN_TYPE } from '@/src/common/constants/common.enum';

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

  @MessagePattern('auth/login', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async login(@Payload() data: LoginDto) {
    return await this.service.login(data);
  }

  @MessagePattern('auth/google/login', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async googleAuthLogin(@Payload() data: GoogleAuthloginDto) {
    return await this.service.googleLogin(data);
  }

  @MessagePattern('auth/google/signup', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async googleAuthSignup(@Payload() data: GoogleAuthSignupDto) {
    return await this.service.googleSignup(data);
  }
}
