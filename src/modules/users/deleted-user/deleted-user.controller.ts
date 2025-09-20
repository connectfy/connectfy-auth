import { Controller } from '@nestjs/common';
import { DeletedUserService } from './deleted-user.service';

@Controller('deleted-user')
export class DeletedUserController {
  constructor(private readonly service: DeletedUserService) {}
}
