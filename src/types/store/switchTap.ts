export interface SwitchTapState {
  manageAccountTapIndex: number;
}

export type SwitchTapActions = {
  updatedManateAccountTabIndex: (tabIndex: SwitchTapState['manageAccountTapIndex']) => void;
};

export type SwitchTapStore = SwitchTapState & SwitchTapActions;
