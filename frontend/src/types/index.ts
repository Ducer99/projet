export interface Person {
  personID: number;
  lastName: string;
  firstName: string;
  birthday?: string;
  email?: string;
  sex: string;
  activity?: string;
  alive: boolean;
  deathDate?: string;
  photoUrl?: string;
  notes?: string;
  fatherID?: number;
  motherID?: number;
  cityID: number;
  familyID: number;
  city?: City;
  family?: Family;
  father?: Person;
  mother?: Person;
}

export interface City {
  cityID: number;
  name: string;
  countryName: string;
}

export interface Family {
  familyID: number;
  familyName: string;
  description?: string;
  createdDate: string;
}

export interface Wedding {
  weddingID: number;
  manID: number;
  womanID: number;
  weddingDate: string;
  divorceDate?: string;
  isActive: boolean;
  location?: string;
  notes?: string;
  man?: Person;
  woman?: Person;
}

export interface Connexion {
  connexionID: number;
  userName: string;
  level: number;
  idPerson: number;
  familyID: number;
  email?: string;
  createdDate: string;
  lastLoginDate?: string;
  isActive: boolean;
}

export interface User {
  connexionID: number;
  userName: string;
  level: number;
  idPerson: number;
  familyID: number;
  personName: string;
  familyName: string;
  role: string; // "Admin", "Member", etc.
}

export interface AuthResponse {
  token: string;
  user: User;
}

// =========== Événements Module ===========

export interface Event {
  eventID: number;
  familyID: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  eventType: 'birth' | 'marriage' | 'death' | 'birthday' | 'party' | 'other';
  location?: string;
  visibility: 'family' | 'private';
  isRecurring: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt?: string;
  participantCount?: number;
  photoCount?: number;
  participants?: EventParticipant[];
  photos?: EventPhoto[];
  creatorName?: string;
}

export interface EventParticipant {
  eventParticipantID: number;
  eventID: number;
  personID: number;
  personName?: string;
  personPhotoUrl?: string;
  status: 'invited' | 'confirmed' | 'declined';
  respondedAt?: string;
}

export interface EventPhoto {
  eventPhotoID: number;
  eventID: number;
  photoUrl: string;
  caption?: string;
  uploadedBy?: number;
  uploadedAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  eventType: 'birth' | 'marriage' | 'death' | 'birthday' | 'party' | 'other';
  location?: string;
  visibility?: 'family' | 'private';
  isRecurring: boolean;
  participantIDs?: number[];
}

export interface UpdateEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  eventType: 'birth' | 'marriage' | 'death' | 'birthday' | 'party' | 'other';
  location?: string;
  visibility?: 'family' | 'private';
  isRecurring: boolean;
}
