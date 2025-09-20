import { Controller } from '@nestjs/common';
import { BannedUserService } from './banned-user.service';

@Controller('banned-user')
export class BannedUserController {
  constructor(private readonly service: BannedUserService) {}
}
