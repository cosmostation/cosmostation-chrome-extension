import { browser } from 'wxt/browser';

import type { Message, MessageResponse } from '@/types/message';

// to service worker
export async function sendMessage<T extends Message>(message: T): Promise<MessageResponse<T>> {
  if (message.target === 'SERVICE_WORKER') {
    return new Promise((resolve, reject) => {
      browser.runtime.sendMessage(browser.runtime.id, message, (response) => {
        if (browser.runtime.lastError) {
          reject(new Error(browser.runtime.lastError.message));
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
        browser.tabs.sendMessage(tabId, message, (response) => {
          if (browser.runtime.lastError) {
            reject(new Error(browser.runtime.lastError.message));
          } else {
            resolve(response);
          }
        }),
      );
    } else {
      return new Promise((resolve, reject) => {
        browser.tabs.query({ url: `${origin}/*` }, (tabs) => {
          if (browser.runtime.lastError) {
            reject(new Error(browser.runtime.lastError.message));
          }

          if (tabs.length === 0) {
            resolve(null!);
          }

          tabs.forEach((tab) => {
            if (tab.id) {
              browser.tabs.sendMessage(tab.id, message, (response) => {
                if (browser.runtime.lastError) {
                  reject(new Error(browser.runtime.lastError.message));
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
