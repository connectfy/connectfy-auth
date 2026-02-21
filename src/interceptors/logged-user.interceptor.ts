import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { CLS_KEYS, ILoggedUser, LANGUAGE } from 'connectfy-shared';

@Injectable()
export class LoggedUserInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcCtx = context.switchToRpc();
    const data = rpcCtx.getData();

    const loggedUser: ILoggedUser | undefined = data?._loggedUser;

    if (loggedUser) {
      const language: LANGUAGE | undefined =
        data?._loggedUser?._lang ?? LANGUAGE.EN;
      return new Observable((subscriber) => {
        this.cls.run(() => {
          this.cls.set(CLS_KEYS.USER, loggedUser);
          this.cls.set(CLS_KEYS.LANG, language);
          next.handle().subscribe(subscriber);
        });
      });
    }

    return new Observable((subscriber) => {
      this.cls.run(() => {
        const language = data?._lang ?? LANGUAGE.EN;
        this.cls.set(CLS_KEYS.LANG, language);
        next.handle().subscribe(subscriber);
      });
    });
  }
}
