//! 生成 PKCE 与授权 URL
//! 运行: cargo run --bin oauth_pkce

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::RngCore;
use sha2::{Digest, Sha256};

fn b64url(bytes: &[u8]) -> String {
    URL_SAFE_NO_PAD.encode(bytes)
}

fn main() {
    let mut v = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut v);
    let code_verifier = b64url(&v);

    let mut hasher = Sha256::new();
    hasher.update(code_verifier.as_bytes());
    let code_challenge = b64url(&hasher.finalize());

    let mut s = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut s);
    let state = b64url(&s);

    let instance = std::env::var("INSTANCE").unwrap_or_else(|_| "https://example.com".into());
    let instance = instance.trim_end_matches('/');
    let client_id = std::env::var("CLIENT_ID").unwrap_or_else(|_| "your-client-id".into());
    let redirect = std::env::var("REDIRECT_URI")
        .unwrap_or_else(|_| "https://your-app.example/oauth/callback".into());
    let scope = std::env::var("SCOPE").unwrap_or_else(|_| "read:profile write:notes".into());

    let authorize_url = format!(
        "{instance}/oauth/authorize?response_type=code&client_id={}&redirect_uri={}&scope={}&state={state}&code_challenge={code_challenge}&code_challenge_method=S256",
        urlencoding_lite(&client_id),
        urlencoding_lite(&redirect),
        urlencoding_lite(&scope),
    );

    println!(
        "{}",
        serde_json::json!({
            "code_verifier": code_verifier,
            "code_challenge": code_challenge,
            "state": state,
            "authorize_url": authorize_url,
        })
    );
}

fn urlencoding_lite(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
            _ => format!("%{:02X}", c as u8),
        })
        .collect()
}
