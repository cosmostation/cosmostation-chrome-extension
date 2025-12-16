import { VIEW_PREFERENCE_TYPE } from '@/constants/userPreference/view';
import type { ViewPreferenceType } from '@/types/userPreference/view';
import { getExtensionLocalStorage } from '@/utils/storage';

let viewPreference: ViewPreferenceType | undefined;

export function getViewPreference() {
  return viewPreference;
}

export async function loadViewPreference() {
  viewPreference = await getExtensionLocalStorage('userViewPreference');
  return viewPreference;
}

export async function applyViewPreference() {
  const view = await loadViewPreference();

  if (view === VIEW_PREFERENCE_TYPE.SIDE_PANEL) {
    await browser.browserAction.setPopup({ popup: '' });
  } else {
    await browser.browserAction.setPopup({ popup: 'popup.html' });
  }
}
