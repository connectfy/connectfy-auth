export class IDeletionOrchestor {
  _id: string;
  userId: string;
  email: string;
  deletionToken: string;
  parts: IDeletionOrchestorPart;
  emailSent: boolean;
}

export interface IDeletionOrchestorPart {
  account: boolean;
  socialLinks: boolean;
  privacySettings: boolean;
  friendships: boolean;
  blocklist: boolean;
  // notifications: boolean;
}
