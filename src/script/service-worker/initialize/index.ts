import { browser as crossBrowser } from 'wxt/browser';

export function initExtensionView() {
  crossBrowser.runtime.onInstalled.addListener((detail) => {
    if (detail.reason === 'install') {
      if (__APP_BROWSER__ === 'firefox') {
        browser.sidebarAction.open();
      } else {
        crossBrowser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      }
    }
  });
}
