export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Vaccine {
  id: string;
  name: string;
  description: string;
  required: boolean;
  recommended: boolean;
  duration: string;
  cost: number;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  description: string;
  prescription: boolean;
  dosage: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'ambulance' | 'police' | 'embassy' | 'hospital';
  address?: string;
}

export interface TravelProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  isPremium: boolean;
}

export interface TravelPlan {
  id: string;
  userId: string;
  country: string;
  countryId?: string;
  city?: string;
  cityId?: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  travelType: 'business' | 'Loisirs' | 'backpacking' | 'family';
  travelers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'vaccine' | 'medicine' | 'document' | 'preparation';
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface EpidemicAlert {
  id: string;
  country: string;
  disease: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
  startDate: Date;
  endDate?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  subscriptionEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  age?: number;
  gender?: string;
  emergencyContact?: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  isPremium: boolean;
  onboarding?: boolean;
  createdAt: Date;
  updatedAt: Date;
} 