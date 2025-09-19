import { RpcException } from '@nestjs/microservices';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '../constants/exception.constants';
import { HttpStatus } from '@nestjs/common';

export class BaseException extends RpcException {
  constructor(
    message = ExceptionMessages.INTERNAL_SERVER_ERROR_MESSAGE,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    error = ExceptionTypes.INTERNAL_SERVER_ERROR,
    additional?: Record<string, any>,
  ) {
    super({ message, statusCode, error, additional });
  }
}
