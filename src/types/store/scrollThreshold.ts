export type ScrollThresholdState = {
  isThresholdExceeded: boolean;
};

export type ScrollThresholdStateActions = {
  updateIsThresholdExceed: (newState: ScrollThresholdState['isThresholdExceeded']) => void;
};

export type ScrollThresholdStore = ScrollThresholdState & ScrollThresholdStateActions;
