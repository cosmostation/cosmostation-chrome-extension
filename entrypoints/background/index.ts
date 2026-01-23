import { defineBackground } from 'wxt/utils/define-background';

import { startServiceWorker } from '@/script/service-worker';

import { initFirefoxViewPreference } from './viewPreference/init';

export default defineBackground({
  type: 'module',
  async main() {
    await initFirefoxViewPreference();

    startServiceWorker();
  },
});
