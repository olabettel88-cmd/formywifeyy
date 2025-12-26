
export interface SipRecord {
  id: string;
  amount: number; // in ml
  timestamp: string;
  label: string;
  icon: string;
  category: string;
}

export interface AppState {
  currentAmount: number; // in Liters
  goal: number; // in Liters
  streak: number;
  mood: string;
  history: SipRecord[];
  // Tracks the last update time for daily reset logic and fixes TS errors
  lastUpdate: number;
}
