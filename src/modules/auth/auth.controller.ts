import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import {
  Controller,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthSignupDto, SignupDto } from './dto/signup.dto';
import { VerifySignupDto } from './dto/verify.dto';
import { GoogleAuthLoginDto, LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { LANGUAGE } from '@/src/common/enums/enums';
import { BaseException } from '@common/exceptions/base.exception';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { RestoreAccountDto } from './dto/restore-account.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';

@Controller('')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @MessagePattern('auth/signup', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async signup(@Payload() data: SignupDto) {
    return await this.service.signup(data);
  }

  @MessagePattern('auth/verify-signup', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async verifySignup(@Payload() data: VerifySignupDto) {
    return await this.service.verifySignup(data);
  }

  @MessagePattern('auth/login', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Payload() data: LoginDto) {
    return await this.service.login(data);
  }

  @MessagePattern('auth/google/login', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async googleAuthLogin(@Payload() data: GoogleAuthLoginDto) {
    return await this.service.googleLogin(data);
  }

  @MessagePattern('auth/google/signup', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async googleAuthSignup(@Payload() data: GoogleAuthSignupDto) {
    return await this.service.googleSignup(data);
  }

  @MessagePattern('auth/forgot-password', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async forgotPassword(@Payload() data: ForgotPasswordDto) {
    return await this.service.forgotPassword(data);
  }

  @MessagePattern('auth/reset-password', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async resetPassword(@Payload() data: ResetPasswordDto) {
    return await this.service.resetPassword(data);
  }

  @MessagePattern('auth/is-valid-token', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async isTokenValid(@Payload() data: ValidateTokenDto) {
    return await this.service.isTokenValid(data);
  }

  @MessagePattern('auth/logout', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async logout() {
    return await this.service.logout();
  }

  @MessagePattern('auth/refresh-token/verify-token', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async verifyAuthToken(
    @Payload()
    {
      access_token,
      refresh_token,
      _lang,
    }: {
      access_token: string;
      refresh_token: string;
      _lang: LANGUAGE;
    },
  ) {
    return await this.service.verifyAuthToken(
      access_token,
      refresh_token,
      _lang,
    );
  }

  @MessagePattern('auth/delete-account', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async deleteAccount(@Payload() data: DeleteAccountDto) {
    return await this.service.deleteAccount(data);
  }

  @MessagePattern('auth/refreshToken', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async refreshToken(@Payload() data: Record<string, any>) {
    if (!data.refresh_token || !data.deviceId || !data.requestData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(LANGUAGE.EN),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
        { nagivate: true },
      );

    return await this.service.refreshToken(data, LANGUAGE.EN);
  }

  @MessagePattern('auth/authenticate-user', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async authenticateUser(@Payload() data: AuthenticateUserDto) {
    return await this.service.authenticateUser(data);
  }

  @MessagePattern('auth/restore-account', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async restoreAccount(@Payload() data: RestoreAccountDto) {
    return await this.service.restoreAccount(data);
  }

  @MessagePattern('auth/deactivate-account', Transport.TCP)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async deactivateAccount(@Payload() data: DeactivateAccountDto) {
    return await this.service.deactivateAccount(data);
  }
}
