import { browser } from 'wxt/browser';

export const getBrowserSidePanelBehavior = async () => {
  const sidePanelBehavior = await browser?.sidePanel?.getPanelBehavior();
  return sidePanelBehavior.openPanelOnActionClick;
};

export function isSidePanelView() {
  return window.location.pathname.includes('sidepanel.html');
}
