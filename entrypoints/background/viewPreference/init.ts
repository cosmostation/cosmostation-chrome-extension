import { registerLifecycleListeners, registerToolbarClickListener, subscribeToViewPreferenceStorageChanges } from './listeners';
import { applyViewPreference } from './state';

export async function initFirefoxViewPreference() {
  if (__APP_BROWSER__ !== 'firefox') return;

  await applyViewPreference();
  registerToolbarClickListener();
  registerLifecycleListeners();
  subscribeToViewPreferenceStorageChanges();
}
