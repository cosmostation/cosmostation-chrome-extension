import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground({
  type: 'module',
  main() {
    void import('@/script/service-worker');
  },
});


