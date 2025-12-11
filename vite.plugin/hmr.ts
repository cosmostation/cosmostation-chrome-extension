import path from 'path';
import type { ModuleNode, PluginOption, ViteDevServer } from 'vite';
import { normalizePath } from 'vite';

type Opts = {
  routerEntries?: string[];
  routesGlob?: RegExp;
  routeTreePattern?: RegExp;
};

export function tanstackRouterHmr(opts: Opts = {}): PluginOption {
  const { routerEntries = ['src/main.tsx'], routesGlob = /\/src\/pages\//, routeTreePattern = /routeTree\.gen(\.(t|j)sx?)?$/ } = opts;

  const routerEntryAbsList = routerEntries.map((p) => normalizePath(path.resolve(process.cwd(), p)));

  function findMods(server: ViteDevServer, absPath: string): ModuleNode[] {
    const set: Set<ModuleNode> | undefined = server.moduleGraph.getModulesByFile(absPath);
    return set ? Array.from(set) : [];
  }

  return {
    name: 'tanstack-router-hmr-wxt',
    apply: 'serve',
    enforce: 'post',

    handleHotUpdate(ctx) {
      const { file, server, modules } = ctx;

      const fileNorm = normalizePath(file);

      if (routerEntryAbsList.includes(fileNorm)) return modules;

      const isRouteTree = routeTreePattern.test(fileNorm);
      const isPages = routesGlob.test(fileNorm);
      if (!isRouteTree && !isPages) return modules;

      const extra: ModuleNode[] = [];
      for (const abs of routerEntryAbsList) {
        extra.push(...findMods(server, abs));
      }
      if (extra.length === 0) return modules;

      const merged = new Set([...modules, ...extra]);
      return Array.from(merged);
    },
  };
}
