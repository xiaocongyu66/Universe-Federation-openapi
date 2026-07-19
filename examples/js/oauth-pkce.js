/**
 * OAuth PKCE 辅助：生成 challenge，并拼出授权 URL
 * 运行: INSTANCE=https://example.com CLIENT_ID=xxx REDIRECT_URI=https://app/callback node oauth-pkce.js
 */
import { createHash, randomBytes } from 'node:crypto';

function base64Url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

const codeVerifier = base64Url(randomBytes(32));
const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest());
const state = base64Url(randomBytes(16));

const instance = (process.env.INSTANCE || 'https://example.com').replace(/\/$/, '');
const clientId = process.env.CLIENT_ID || 'your-client-id';
const redirectUri = process.env.REDIRECT_URI || 'https://your-app.example/oauth/callback';
const scope = process.env.SCOPE || 'read:profile write:notes';

const url = new URL('/oauth/authorize', instance);
url.searchParams.set('response_type', 'code');
url.searchParams.set('client_id', clientId);
url.searchParams.set('redirect_uri', redirectUri);
url.searchParams.set('scope', scope);
url.searchParams.set('state', state);
url.searchParams.set('code_challenge', codeChallenge);
url.searchParams.set('code_challenge_method', 'S256');

console.log(JSON.stringify({
  code_verifier: codeVerifier,
  code_challenge: codeChallenge,
  state,
  authorize_url: url.toString(),
  hint: '用户浏览器打开 authorize_url；回调后用 code + code_verifier 请求 POST /oauth/token',
}, null, 2));
