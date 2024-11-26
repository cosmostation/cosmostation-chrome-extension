export const getBrowserSidePanelBehavior = async () => {
  if (__APP_BROWSER__ === 'chrome') {
    const sidePanelBehavior = await chrome.sidePanel.getPanelBehavior();
    return sidePanelBehavior.openPanelOnActionClick;
  }
};

export function isSidePanelView() {
  return window.location.pathname.includes('sidepanel.html');
}
