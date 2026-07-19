/**
 * 读取实例公开信息
 * 运行: INSTANCE=https://example.com npx --yes tsx meta.ts
 */
const instance = (process.env.INSTANCE ?? 'https://example.com').replace(/\/$/, '');

interface MetaLite {
  name?: string;
  version?: string;
  uri?: string;
}

async function main(): Promise<void> {
  const res = await fetch(`${instance}/api/meta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ detail: true }),
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
  const meta = (await res.json()) as MetaLite;
  console.log({ name: meta.name, version: meta.version, uri: meta.uri });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
