export type LoadingOverlayState = {
  loading: boolean;
  title?: string;
  message?: string;
};

export type LoadingOverlayStateActions = {
  startLoadingOverlay: (title: LoadingOverlayState['title'], message: LoadingOverlayState['message']) => void;
  stopLoadingOverlay: () => void;
  updateTexts: (title: LoadingOverlayState['title'], message: LoadingOverlayState['message']) => void;
};

export type LoadingOverlayStore = LoadingOverlayState & LoadingOverlayStateActions;
