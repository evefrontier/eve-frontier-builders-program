// Messages to and from public/move/compiler.worker.js

export type BuildRequest = { revision: number; files: Record<string, string> };

export type BuildResponse =
  | { revision: number; ok: true; bytes: number; digest: string; suiVersion: string; warnings?: string }
  | { revision: number; ok: false; error: string };
