#!/usr/bin/env node
/**
 * 从目标实例拉取完整开放 API 文档（GET /api.json）
 *
 *   node scripts/fetch-openapi.mjs https://example.com
 *   node scripts/fetch-openapi.mjs https://example.com --also-oauth
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function usage(code = 0) {
  console.log(`用法: node scripts/fetch-openapi.mjs <实例地址> [--out 路径] [--also-oauth]`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { origin: null, out: null, alsoOauth: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') usage(0);
    if (a === '--also-oauth') { args.alsoOauth = true; continue; }
    if (a === '--out') { args.out = argv[++i]; continue; }
    if (a.startsWith('-')) { console.error('未知参数', a); usage(1); }
    rest.push(a);
  }
  args.origin = rest[0] ?? null;
  return args;
}

function hostSlug(origin) {
  return new URL(origin).host.replace(/[^a-zA-Z0-9.-]+/g, '_');
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Universe-Federation-openapi/1.0' },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}\n${text.slice(0, 400)}`);
  return JSON.parse(text);
}

const args = parseArgs(process.argv.slice(2));
if (!args.origin) usage(1);
const origin = new URL(args.origin).origin;

const spec = await fetchJson(new URL('/api.json', origin).href);
const pathCount = spec.paths ? Object.keys(spec.paths).length : 0;
console.error(`OpenAPI ${spec.openapi ?? '?'}  接口数≈${pathCount}`);

const out = args.out ?? join(root, 'openapi', `api.${hostSlug(origin)}.json`);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(spec, null, 2) + '\n');
console.error('已写入', out);

if (args.alsoOauth) {
  try {
    const meta = await fetchJson(new URL('/.well-known/oauth-authorization-server', origin).href);
    const p = join(dirname(out), `oauth-as.${hostSlug(origin)}.json`);
    await writeFile(p, JSON.stringify(meta, null, 2) + '\n');
    console.error('已写入', p);
  } catch (e) {
    console.error('OAuth 元数据不可用:', e.message);
  }
}
console.log(out);
