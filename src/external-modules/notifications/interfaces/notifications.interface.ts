import { LANGUAGE } from 'connectfy-shared';

export interface ISendEmail {
  to: string;
  language: LANGUAGE;
  additional?: Record<string, any>;
}
