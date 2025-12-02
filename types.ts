export interface Person {
  id: string;
  name: string;
  balance: number;
  color: string;
  avatarSeed: string; // For generating consistent avatars
}

export type ChoreFrequency = 'ONCE' | 'DAILY' | 'WEEKLY';

// The Master Definition of a task
export interface Chore {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string; // Emoji or icon name
}

// The connection between a Person and a Chore with scheduling rules
export interface ChoreAssignment {
  id: string;
  choreId: string;
  personId: string;
  frequency: ChoreFrequency;
  dueDate?: string; // ISO Date string (YYYY-MM-DD)
  lastCompletedAt?: string; // ISO Timestamp
  isActive: boolean;
}

export interface Transaction {
  id: string;
  personId: string;
  choreId?: string; 
  description: string;
  amount: number;
  type: 'EARN' | 'SPEND';
  timestamp: string;
}

export interface AppState {
  people: Person[];
  chores: Chore[];
  assignments: ChoreAssignment[];
  history: Transaction[];
}

export enum Tab {
  DASHBOARD = 'dashboard',
  FAMILY = 'family',
  CHORES = 'chores',
  REDEEM = 'redeem'
}