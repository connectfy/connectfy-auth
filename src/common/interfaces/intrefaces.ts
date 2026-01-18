import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { PopulateOptions } from 'mongoose';

interface ISendWithContextParams {
  endpoint: string;
  payload?: any;
}

interface IEmitWithContextParams {
  topic: string;
  payload?: any;
}

export interface ISendWithContextClientParams extends ISendWithContextParams {
  client: ClientProxy;
}

export interface IEmitWithContextClientParams extends IEmitWithContextParams {
  client: ClientKafka;
}

export interface ICountry {
  key: string;
  name: string;
  flag: string;
  code: string;
  numberLength: number;
}

export interface IBaseRepositoryOptions {
  lean?: boolean;
  populate?: string | PopulateOptions | string[] | PopulateOptions[];
}

export interface IBaseRepositoryUpdateOptions extends IBaseRepositoryOptions {
  new?: boolean;
  upsert?: boolean;
  runValidators?: boolean;
}

export interface IBaseRepositoryRemoveOptions extends IBaseRepositoryOptions {}

export interface IBaseRepositoryInterface {
  _id: string;
  [key: string]: any;
}
