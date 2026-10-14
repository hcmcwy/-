export interface Participant {
  id: string;
  name: string;
  weight?: number;
  department?: string;
  note?: string;
  color?: string;
}

export type WinnerAction = 'kept' | 'removed';

export interface DrawRecord {
  id: string;
  round: number;
  winner: Participant;
  action: WinnerAction;
  timestamp: number;
  prizeTitle?: string;
}

export interface WheelConfig {
  spinDuration: number; // in seconds, e.g. 5
  soundEnabled: boolean;
  confettiEnabled: boolean;
  currentPrize: string;
  autoOpenWinnerModal: boolean;
}
