import { glob } from 'glob';
import type { PluginOption } from 'vite';

export default function watchFilesPlugin(patterns: string[]): PluginOption {
  return {
    name: 'watch-files-plugin',
    buildStart() {
      const files = patterns.flatMap((pattern) => glob.sync(pattern, { nodir: true }));

      files.forEach((file) => {
        this.addWatchFile(file);
      });
    },
  };
}
