// Workspace discovery shared by the release checks and the showcase build.

import fs from 'node:fs';
import path from 'node:path';

export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

// Package folders matched by the root `workspaces` globs (only `dir/*` is supported).
export function listWorkspaces(root) {
  const { workspaces = [] } = readJson(path.join(root, 'package.json'));
  return workspaces.flatMap((pattern) => {
    if (!pattern.endsWith('/*')) throw new Error(`Unsupported workspace pattern "${pattern}"`);
    const parent = path.join(root, pattern.slice(0, -2));
    if (!fs.existsSync(parent)) return [];
    return fs.readdirSync(parent, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(parent, d.name, 'package.json')))
      .map((d) => path.join(parent, d.name));
  });
}

// "owner/repo" from a package.json `repository` field.
export function repoSlug(pkg) {
  const url = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url ?? '';
  return url.match(/github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/)?.[1] ?? '';
}
