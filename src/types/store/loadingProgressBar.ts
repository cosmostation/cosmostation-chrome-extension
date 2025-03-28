export interface LoadingProgressBarState {
  progressValue: number;
}

export type LoadingProgressBarActions = {
  updateProgressValue: (progressValue: LoadingProgressBarState['progressValue']) => void;
};

export type LoadingProgressBarStore = LoadingProgressBarState & LoadingProgressBarActions;
