export type CaseStatus = 'ACTIVE' | 'POSSIBLE_MATCH' | 'FOUND' | 'CLOSED' | 'POLICE_HANDLED';

export interface MissingPerson {
  id: string;
  reporterId: string;
  status: CaseStatus;
  fullName: string;
  nickname?: string;
  age?: number;
  gender?: string;
  photoUrl?: string;
  clothingDescription?: string;
  height?: string;
  languageSpoken?: string;
  
  // Memory fields
  motherName?: string;
  fatherName?: string;
  siblingNames?: string;
  school?: string;
  village?: string;
  locality?: string;
  colony?: string;
  nearbyLandmark?: string;
  
  // Incident fields
  lastSeenLocation?: string;
  missingDate?: string;
  mentalCondition?: string;
  medicalCondition?: string;
  additionalNotes?: string;
  
  // Contact details
  primaryPhone?: string;
  secondaryPhone?: string;
  whatsappNumber?: string;
  
  // Reward
  rewardAvailable: boolean;
  rewardAmount?: number;
  
  createdAt: any;
  updatedAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'reporter' | 'admin';
  createdAt: any;
}

export interface FoundReport {
  id: string;
  missingPersonId: string;
  helperName: string;
  helperPhone?: string;
  currentLocation?: string;
  notes?: string;
  photoUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: any;
}
