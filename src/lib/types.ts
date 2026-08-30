export interface PartyMember {
  id: string;
  name: string;
  attending: boolean;
  events: {
    welcomeDinner: boolean;
    recoveryDay: boolean;
    wedding: boolean;
  };
  dietaryRequirements: string;
}

export interface Party {
  id: string;
  code: string;
  name: string;
  members: PartyMember[];
  email: string;
  songRequest: string;
  message: string;
  submittedAt: string | null;
  updatedAt: string | null;
}

export interface RSVPSubmission {
  code: string;
  email: string;
  members: {
    id: string;
    attending: boolean;
    events: {
      welcomeDinner: boolean;
      recoveryDay: boolean;
      wedding: boolean;
    };
    dietaryRequirements: string;
  }[];
  songRequest: string;
  message: string;
}
