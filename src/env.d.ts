/// <reference types="vite/client" />

declare const __LUCKY_UI_BUILD_IDENTITY__: Readonly<{
  commit: string;
  branch: string;
  dirty: boolean;
  sourceDigest: string;
  version: string;
  buildMode: 'static-build' | 'dev-server';
  provenance: 'git-worktree' | 'unverified';
  valid: boolean;
}>;

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}
