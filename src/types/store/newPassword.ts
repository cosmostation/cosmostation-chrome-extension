export interface NewPasswordState {
  password: string;
  key: string;
  timestamp: number;
}

export type NewPasswordStateActions = {
  updateNewPassword: (passwordInfo: NewPasswordState['password']) => void;
};

export type NewPasswordStore = NewPasswordState & NewPasswordStateActions;
