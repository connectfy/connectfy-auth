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
      return new Observable(subscriber => {
        this.cls.run(() => {
          this.cls.set('user', loggedUser);
          next.handle().subscribe(subscriber);
        });
      });
    }

    return next.handle();
  }
}
