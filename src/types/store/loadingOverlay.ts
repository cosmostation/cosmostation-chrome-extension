export type LoadingOverlayState = {
  loading: boolean;
};

export type LoadingOverlayStateActions = {
  updateLoadingOverlay: (newState: LoadingOverlayState['loading']) => void;
};

export type LoadingOverlayStore = LoadingOverlayState & LoadingOverlayStateActions;
