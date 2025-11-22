import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class LoggedUserInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Microservice (TCP) context
    const rpcCtx = context.switchToRpc();
    const data = rpcCtx.getData() as any;
    
    const loggedUser = data?._loggedUser;

    if (loggedUser) {        
      this.cls.set('user', loggedUser);
      // this.cls.set('userId', loggedUser.id); // optional
    }

    return next.handle();
  }
}
