export interface IPhoneNumber {
  countryCode: string;
  number: string;
  fullPhoneNumber: string;
}

export interface IReturnedPhoneNumber {
  countryCode?: string;
  number?: string;
  fullPhoneNumber?: string;
}
