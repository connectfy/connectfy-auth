import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { ILoggedUser } from '@common/interfaces/request.interface';
import { CLS_KEYS } from '@common/enums/enums';

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

    return next.handle();
  }
}
