import { readFileSync } from 'fs';
import type { NormalizedOutputOptions, OutputBundle } from 'rollup';
import type { PluginOption } from 'vite';

export function chromeManifestPlugin(manifestPath: string): PluginOption {
  return {
    name: 'chrome-manifest',
    enforce: 'post',
    buildStart() {
      this.addWatchFile(manifestPath);
    },
    async generateBundle(/* _: NormalizedOutputOptions  , bundle: OutputBundle */) {
      const chromeManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

      const withJs = {
        version: process.env.npm_package_version,
      };

      const manifest = { ...chromeManifest, ...withJs };

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest),
      });
    },
  };
}

export function firefoxManifestPlugin(manifestPath: string): PluginOption {
  return {
    name: 'firefox-manifest',
    enforce: 'post',
    buildStart() {
      this.addWatchFile(manifestPath);
    },
    async generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
      const chromeManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      const prefix = 'js';
      const files = Object.keys(bundle);

      const filesWithoutMap = files.filter((file) => !file.endsWith('.map'));

      const serviceWorker = filesWithoutMap.filter((file) => file.includes(`${prefix}/service_worker`));
      const inject = filesWithoutMap.filter((file) => file.includes(`${prefix}/inject`));
      const content = filesWithoutMap.filter((file) => file.includes(`${prefix}/content`));

      const withJs = {
        version: process.env.npm_package_version,
        background: {
          scripts: serviceWorker,
        },
        web_accessible_resources: [
          {
            resources: inject,
            matches: ['<all_urls>'],
          },
        ],
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: content,
            run_at: 'document_start',
            all_frames: true,
          },
        ],
      };

      const manifest = { ...chromeManifest, ...withJs };

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest),
      });
    },
  };
}
