import type { PluginOption } from 'vite';

export function wrapInjectScriptPlugin(): PluginOption {
  return {
    name: 'wrap-inject-script',
    enforce: 'post',
    generateBundle(_, bundle) {
      const injectFile = bundle['inject.js'];

      if (injectFile && injectFile.type === 'chunk') {
        const originalCode = injectFile.code;

        injectFile.code = `(function() {\n${originalCode}\n})();`;
      }
    },
  };
}
