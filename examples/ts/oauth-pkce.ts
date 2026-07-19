/**
 * OAuth PKCE 辅助
 * 运行: npx --yes tsx oauth-pkce.ts
 */
import { createHash, randomBytes } from 'node:crypto';

function base64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function generatePkce(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = base64Url(randomBytes(32));
  const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest());
  return { codeVerifier, codeChallenge };
}

export function buildAuthorizeUrl(opts: {
  instance: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  codeChallenge: string;
  state?: string;
}): { url: string; state: string } {
  const state = opts.state ?? base64Url(randomBytes(16));
  const url = new URL('/oauth/authorize', opts.instance.replace(/\/$/, ''));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', opts.clientId);
  url.searchParams.set('redirect_uri', opts.redirectUri);
  url.searchParams.set('scope', opts.scope ?? 'read:profile write:notes');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', opts.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return { url: url.toString(), state };
}

const pkce = generatePkce();
const { url, state } = buildAuthorizeUrl({
  instance: process.env.INSTANCE ?? 'https://example.com',
  clientId: process.env.CLIENT_ID ?? 'your-client-id',
  redirectUri: process.env.REDIRECT_URI ?? 'https://your-app.example/oauth/callback',
  codeChallenge: pkce.codeChallenge,
});

console.log(
  JSON.stringify(
    {
      code_verifier: pkce.codeVerifier,
      code_challenge: pkce.codeChallenge,
      state,
      authorize_url: url,
    },
    null,
    2,
  ),
);
