import { Controller } from '@nestjs/common';
import { DeactivatedUsersService } from './deactivated-users.service';

@Controller()
export class DeactivatedUsersController {
  constructor(private readonly service: DeactivatedUsersService) {}
}
