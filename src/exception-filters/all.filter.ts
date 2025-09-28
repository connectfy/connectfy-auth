import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError, Observable } from 'rxjs';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';
import { HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    let message = ExceptionMessages.INTERNAL_SERVER_ERROR_MESSAGE;
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorType = ExceptionTypes.INTERNAL_SERVER_ERROR;
    let additional: Record<string, any> | undefined;

    console.log('\n');
    if (exception.stack) this.logger.error('Exception stack', exception.stack);
    this.logger.error('Exception caught', JSON.stringify(exception, null, 2));

    // 1. If it's a proper NestJS HttpException (or customed exception)
    if (exception instanceof RpcException) {
      const error = exception.getError();

      if (typeof error === 'object') {
        message = (error as any)?.message || message;
        statusCode = (error as any)?.statusCode || statusCode;
        errorType = (error as any)?.error || errorType;
        additional = (error as { additional?: Record<string, any> })
          ?.additional;
      } else message = error;
    }

    // 2. If it's a DTO validation error
    else if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const resObj =
        typeof response === 'string'
          ? { message: response }
          : (response as any);

      message = resObj.message || exception.message;
      statusCode = exception.getStatus();
      errorType = resObj.error || exception.name;
      additional = resObj?.additional;
    }
    // 3. If it's DB level error
    // else if (exception instanceof Error) {
    // message = exception.message;
    // }

    const lastResult = {
      status: 'error',
      message,
      statusCode,
      error: errorType,
    };

    if (additional) lastResult['additional'] = additional;

    return throwError(() => lastResult);
  }
}
