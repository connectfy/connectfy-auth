import { LANGUAGE } from 'connectfy-shared';

export interface ISendEmail {
  to: string;
  _lang: LANGUAGE;
  additional?: Record<string, any>;
}
