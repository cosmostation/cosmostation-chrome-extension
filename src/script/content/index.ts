const rootElement = document.head || document.documentElement;
const scriptElement = document.createElement('script');

scriptElement.src = chrome.runtime.getURL('js/inject.js');
scriptElement.type = 'text/javascript';
rootElement.appendChild(scriptElement);
scriptElement.remove();
