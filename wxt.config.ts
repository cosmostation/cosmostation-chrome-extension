import { resolve as pathResolve } from 'path';
import esToolkitPlugin from 'vite-plugin-es-toolkit';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import type { WxtViteConfig } from 'wxt';
import { defineConfig } from 'wxt';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

import { tanstackRouterHmr } from './vite.plugin/hmr';

const EXTENSION_DESCRIPTION = 'Non-custodial multi-chain extension wallet powered by Cosmostation, the interchain validator.';

const ICONS: Record<string, string> = {
  '16': 'extension-assets/icon16-dark.png',
  '19': 'extension-assets/icon19-dark.png',
  '24': 'extension-assets/icon24-dark.png',
  '32': 'extension-assets/icon32-dark.png',
  '38': 'extension-assets/icon38-dark.png',
  '48': 'extension-assets/icon48-dark.png',
  '64': 'extension-assets/icon64-dark.png',
  '128': 'extension-assets/icon128-dark.png',
  '256': 'extension-assets/icon256-dark.png',
  '512': 'extension-assets/icon512-dark.png',
};

const PERMISSIONS: Record<string, string[]> = {
  chrome: ['storage', 'unlimitedStorage', 'tabs', 'sidePanel'],
  firefox: ['storage', 'unlimitedStorage', 'clipboardWrite', 'activeTab', 'webRequest'],
};

const OPTIONAL_PERMISSIONS: Record<string, string[]> = {
  firefox: ['clipboardWrite', 'activeTab', 'webRequest'],
};

function kstStamp() {
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const kst = new Date(now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60_000);
  const y = kst.getFullYear();
  const m = pad(kst.getMonth() + 1);
  const d = pad(kst.getDate());
  const H = pad(kst.getHours());
  const M = pad(kst.getMinutes());
  const S = pad(kst.getSeconds());
  return `${y}${m}${d}T${H}${M}${S}`;
}

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  targetBrowsers: ['chrome', 'firefox'],
  webExt: {
    disabled: true,
  },
  manifestVersion: 3,
  hooks: {
    'config:resolved': (wxt) => {
      wxt.config.alias['@'] = pathResolve(wxt.config.root, 'src');
      wxt.config.alias.assets = pathResolve(wxt.config.root, 'src/assets');
      wxt.config.alias.components = pathResolve(wxt.config.root, 'src/components');
    },
    'build:manifestGenerated': (wxt, manifest) => {
      if (wxt.config.mode === 'development') {
        manifest.name += ' (DEV)';
      }
    },
  },
  zip: {
    artifactTemplate: `{{name}}-{{version}}-{{browser}}-${kstStamp()}.zip`,
    zipSources: false,
  },
  manifest: ({ browser }) => {
    const isFirefox = browser === 'firefox';
    const permissions = PERMISSIONS[browser] ?? PERMISSIONS.chrome;
    const optionalPermissions = OPTIONAL_PERMISSIONS[browser];
    return {
      name: 'Cosmostation Wallet',
      description: EXTENSION_DESCRIPTION,
      icons: ICONS,
      action: {
        default_title: 'Cosmostation Wallet',
        default_icon: ICONS,
      },
      permissions,
      optional_permissions: optionalPermissions,
      host_permissions: ['<all_urls>'],
      web_accessible_resources: [
        {
          resources: ['inject.js'],
          matches: ['<all_urls>'],
        },
      ],
      ...(isFirefox
        ? {
            author: 'Cosmostation',
            browser_specific_settings: {
              gecko: {
                id: 'support@cosmostation.io',
              },
            },
          }
        : {}),
    };
  },
  vite: ({ mode, browser }) => {
    const isProduction = mode === 'production';

    const modePlugins = isProduction
      ? []
      : [
          tanstackRouterHmr({
            routerEntries: ['src/main.tsx'],
            routesGlob: /\/src\/pages\//,
            routeTreePattern: /routeTree\.gen(\.(t|j)sx?)?$/,
          }),
        ];
    return {
      define: {
        __APP_BROWSER__: JSON.stringify(browser),
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        __APP_MODE__: JSON.stringify(mode),
      },
      plugins: [
        TanStackRouterVite({ routesDirectory: 'src/pages' }),
        nodePolyfills(),
        svgr({
          svgrOptions: { exportType: 'default', ref: true, svgo: false, titleProp: true },
          include: '**/*.svg',
        }),
        ...modePlugins,
        esToolkitPlugin(),
      ],
    } as WxtViteConfig;
  },
});
