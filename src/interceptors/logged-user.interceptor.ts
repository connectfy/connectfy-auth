import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { ILoggedUser, CLS_KEYS } from 'connectfy-shared';

@Injectable()
export class LoggedUserInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcCtx = context.switchToRpc();
    const data = rpcCtx.getData();

    const loggedUser: ILoggedUser | undefined = data?._loggedUser;

    if (loggedUser) {
      return new Observable((subscriber) => {
        this.cls.run(() => {
          this.cls.set(CLS_KEYS.USER, loggedUser.user);
          this.cls.set(CLS_KEYS.ACCOUNT, loggedUser.account);
          this.cls.set(CLS_KEYS.SETTINGS, loggedUser.settings);
          this.cls.set(
            CLS_KEYS.LANG,
            loggedUser.settings.generalSettings.language,
          );
          next.handle().subscribe(subscriber);
        });
      });
    }

    this.cls.set(CLS_KEYS.LANG, data?._lang);
    return next.handle();
  }
}
