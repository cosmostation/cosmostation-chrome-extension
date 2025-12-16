import { VIEW_PREFERENCE_TYPE } from '@/constants/userPreference/view';

import { applyViewPreference, getViewPreference } from './state';

export function registerToolbarClickListener() {
  browser.browserAction.onClicked.addListener(() => {
    if (getViewPreference() === VIEW_PREFERENCE_TYPE.SIDE_PANEL) {
      browser.sidebarAction.toggle();
    }
  });
}

export function registerLifecycleListeners() {
  browser.runtime.onStartup.addListener(() => void applyViewPreference());
  browser.runtime.onInstalled.addListener(() => void applyViewPreference());
}

export function subscribeToViewPreferenceStorageChanges() {
  browser.storage?.onChanged?.addListener((changes, area) => {
    if (area === 'local' && changes.userViewPreference) {
      void applyViewPreference();
    }
  });
}
