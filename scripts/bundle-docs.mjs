#!/usr/bin/env node
/**
 * Print a short catalog of docs for CI / release notes.
 */
import { readdir, stat } from 'node:fs/promises';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function walk(dir, acc = []) {
	for (const name of await readdir(dir)) {
		if (name === 'node_modules' || name === '.git') continue;
		const p = join(dir, name);
		const s = await stat(p);
		if (s.isDirectory()) await walk(p, acc);
		else if (/\.(md|yaml|yml|json|mjs|js)$/i.test(name)) acc.push(p);
	}
	return acc;
}

const files = await walk(root);
for (const f of files.sort()) {
	const s = await stat(f);
	console.log(`${String(s.size).padStart(8)}  ${relative(root, f)}`);
}
