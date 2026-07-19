/**
 * 读取实例公开信息（无需登录）
 * 运行: INSTANCE=https://example.com node meta.js
 */
const instance = (process.env.INSTANCE || 'https://example.com').replace(/\/$/, '');

const res = await fetch(`${instance}/api/meta`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ detail: true }),
});

if (!res.ok) {
  console.error(res.status, await res.text());
  process.exit(1);
}

const meta = await res.json();
console.log({
  name: meta.name,
  version: meta.version,
  uri: meta.uri,
});
