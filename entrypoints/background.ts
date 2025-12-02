import { defineBackground } from 'wxt/utils/define-background';

import { startServiceWorker } from '@/script/service-worker';

export default defineBackground({
  type: 'module',
  main() {
    startServiceWorker();
  },
});
