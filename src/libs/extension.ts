import type { Message, MessageResponse } from '@/types/message';

// to service worker
export async function sendMessage<T extends Message>(message: T): Promise<MessageResponse<T>> {
  if (message.target === 'SERVICE_WORKER') {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(chrome.runtime.id, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  if (message.target === 'CONTENT') {
    const { tabId } = message;

    if (tabId) {
      return new Promise((resolve, reject) =>
        chrome.tabs.sendMessage(tabId, message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        }),
      );
    } else {
      return new Promise((resolve, reject) => {
        chrome.tabs.query({ url: `${origin}/*` }, (tabs) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          }

          if (tabs.length === 0) {
            resolve(null!);
          }

          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, message, (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(response);
                }
              });
            }
          });
        });
      });
    }
  }

  return null!;
}
