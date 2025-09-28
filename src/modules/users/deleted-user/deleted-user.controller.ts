import { Controller } from '@nestjs/common';
import { DeletedUserService } from './deleted-user.service';

@Controller('')
export class DeletedUserController {
  constructor(private readonly service: DeletedUserService) {}
}
