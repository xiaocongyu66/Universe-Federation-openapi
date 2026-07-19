/**
 * Bearer 发帖
 * 运行: INSTANCE=https://example.com TOKEN=xxx npx --yes tsx create-note.ts
 */
const instance = (process.env.INSTANCE ?? 'https://example.com').replace(/\/$/, '');
const token = process.env.TOKEN;

async function main(): Promise<void> {
  if (!token) throw new Error('请设置 TOKEN');

  const res = await fetch(`${instance}/api/notes/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text: process.env.TEXT ?? 'Hello from an open app (TypeScript)',
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  console.log(text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
