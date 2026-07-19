/**
 * 使用开放 API 发帖（需要 write:notes）
 * 运行: INSTANCE=https://example.com TOKEN=xxx node create-note.js
 */
const instance = (process.env.INSTANCE || 'https://example.com').replace(/\/$/, '');
const token = process.env.TOKEN;
if (!token) {
  console.error('请设置环境变量 TOKEN（OAuth access_token）');
  process.exit(1);
}

const res = await fetch(`${instance}/api/notes/create`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({
    text: process.env.TEXT || 'Hello from an open app (JavaScript)',
  }),
});

const body = await res.text();
if (!res.ok) {
  console.error(res.status, body);
  process.exit(1);
}
console.log(body);
