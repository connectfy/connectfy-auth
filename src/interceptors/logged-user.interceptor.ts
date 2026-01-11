import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { ILoggedUser } from '../common/interfaces/request.interface';

@Injectable()
export class LoggedUserInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcCtx = context.switchToRpc();
    const data = rpcCtx.getData() as any;

    const loggedUser: ILoggedUser | undefined = data?._loggedUser;

    if (loggedUser) {
      return new Observable((subscriber) => {
        this.cls.run(() => {
          this.cls.set('user', loggedUser.user);
          this.cls.set('account', loggedUser.account);
          this.cls.set('settings', loggedUser.settings);
          this.cls.set('lang', loggedUser.settings.generalSettings.language);
          next.handle().subscribe(subscriber);
        });
      });
    }

    return next.handle();
  }
}
