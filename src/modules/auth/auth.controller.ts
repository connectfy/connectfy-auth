import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { Controller, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthSignupDto, SignupDto } from './dto/signup.dto';
import { VerifySignupDto, VerifyLoginDto } from './dto/verify.dto';
import { GoogleAuthLoginDto, LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { LANGUAGE, BaseException, ExceptionMessages } from 'connectfy-shared';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { RestoreAccountDto } from './dto/restore-account.dto';
import { DeactivateAccountDto } from './dto/deactivate-account.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller('')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @MessagePattern('auth/signup', Transport.TCP)
  async signup(@Payload() data: SignupDto) {
    return this.service.signup(data);
  }

  @MessagePattern('auth/verify-signup', Transport.TCP)
  async verifySignup(@Payload() data: VerifySignupDto) {
    return this.service.verifySignup(data);
  }

  @MessagePattern('auth/verify-signup/resend', Transport.TCP)
  async resendSignupVerify(@Payload() data: SignupDto) {
    if (!data)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(LANGUAGE.EN),
        HttpStatus.NOT_FOUND,
        { navigate: true },
      );

    return this.service.resendSignupVerify(data);
  }

  @MessagePattern('auth/login', Transport.TCP)
  async login(@Payload() data: LoginDto) {
    return this.service.login(data);
  }

  @MessagePattern('auth/verify-login', Transport.TCP)
  async verifyLogin(@Payload() data: VerifyLoginDto) {
    return this.service.verifyLogin(data);
  }

  @MessagePattern('auth/google/login', Transport.TCP)
  async googleAuthLogin(@Payload() data: GoogleAuthLoginDto) {
    return this.service.googleLogin(data);
  }

  @MessagePattern('auth/google/signup', Transport.TCP)
  async googleAuthSignup(@Payload() data: GoogleAuthSignupDto) {
    return this.service.googleSignup(data);
  }

  @MessagePattern('auth/forgot-password', Transport.TCP)
  async forgotPassword(@Payload() data: ForgotPasswordDto) {
    return this.service.forgotPassword(data);
  }

  @MessagePattern('auth/reset-password', Transport.TCP)
  async resetPassword(@Payload() data: ResetPasswordDto) {
    return this.service.resetPassword(data);
  }

  @MessagePattern('auth/is-valid-token', Transport.TCP)
  async isTokenValid(@Payload() data: ValidateTokenDto) {
    return this.service.isTokenValid(data);
  }

  @MessagePattern('auth/logout', Transport.TCP)
  async logout(@Payload() data: LogoutDto) {
    return this.service.logout(data);
  }

  @MessagePattern('auth/refresh-token/verify-token', Transport.TCP)
  async verifyAuthToken(
    @Payload()
    {
      access_token,
      refresh_token,
    }: {
      access_token: string;
      refresh_token: string;
    },
  ) {
    return this.service.verifyAuthToken(access_token, refresh_token);
  }

  @MessagePattern('auth/delete-account', Transport.TCP)
  async deleteAccount(@Payload() data: DeleteAccountDto) {
    return this.service.deleteAccount(data);
  }

  @MessagePattern('auth/refreshToken', Transport.TCP)
  async refreshToken(@Payload() data: Record<string, any>) {
    if (!data.refresh_token || !data.deviceId || !data.requestData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(LANGUAGE.EN),
        HttpStatus.NOT_FOUND,
        { navigate: true },
      );

    return this.service.refreshToken(data);
  }

  @MessagePattern('auth/authenticate-user', Transport.TCP)
  async authenticateUser(@Payload() data: AuthenticateUserDto) {
    return this.service.authenticateUser(data);
  }

  @MessagePattern('auth/restore-account', Transport.TCP)
  async restoreAccount(@Payload() data: RestoreAccountDto) {
    return this.service.restoreAccount(data);
  }

  @MessagePattern('auth/deactivate-account', Transport.TCP)
  async deactivateAccount(@Payload() data: DeactivateAccountDto) {
    return this.service.deactivateAccount(data);
  }
}
