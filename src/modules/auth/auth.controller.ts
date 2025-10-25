import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { Controller, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthSignupDto, SignupDto } from './dto/signup.dto';
import { VerifySignupDto } from './dto/verify.dto';
import { GoogleAuthloginDto, LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { DeleteAccountDto, RemoveAccountDto } from './dto/delete-account.dto';
import { LANGUAGE } from '@common/constants/common.enum';
import { BaseException } from '@common/exceptions/base.exception';
import { ExceptionMessages, ExceptionTypes } from '@common/constants/exception.constants';

@Controller('')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @MessagePattern('auth/signup', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async signup(@Payload() data: SignupDto) {
    return await this.service.signup(data);
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

  @MessagePattern('auth/forgot-password', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async forgotPassword(@Payload() data: ForgotPasswordDto) {
    return await this.service.forgotPassword(data);
  }

  @MessagePattern('auth/reset-password', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async resetPassword(@Payload() data: ResetPasswordDto) {
    return await this.service.resetPassword(data);
  }

  @MessagePattern('auth/logout', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async logout(@Payload() data: LogoutDto) {
    return await this.service.logout(data);
  }

  @MessagePattern('auth/refresh-token/verify-token', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async verifyAuthToken(@Payload() { access_token, _lang }: { access_token: string, _lang: LANGUAGE }) {
    return await this.service.verifyAuthToken(access_token, _lang);
  }

  @MessagePattern('auth/delete-account', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async deleteAccount(@Payload() data: DeleteAccountDto) {
    return await this.service.deleteAccount(data);
  }

  @MessagePattern('auth/remove-account', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
  async removeAccount(@Payload() data: RemoveAccountDto) {
    return await this.service.removeAccount(data);
  }

  @MessagePattern('auth/refreshToken', Transport.TCP)
  async refreshToken(@Payload() { refresh_token, _lang }: { refresh_token: string, _lang: LANGUAGE }) {
    if (!refresh_token) 
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    return await this.service.refreshToken(refresh_token, _lang);
  }
}
