import { extension } from '../browser';

export function getCurrentWindowInfo() {
  return extension.windows.getCurrent();
}
