import { Injectable } from '@nestjs/common';
import { DeactivatedUserRepository } from './repo/deactivated-user.repo';

@Injectable()
export class DeactivatedUsersService {
  constructor(private readonly repo: DeactivatedUserRepository) {}
}
