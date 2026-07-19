//! Bearer 发帖
//! 运行: INSTANCE=https://example.com TOKEN=xxx cargo run --bin create_note

use serde_json::json;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let instance = std::env::var("INSTANCE").unwrap_or_else(|_| "https://example.com".into());
    let instance = instance.trim_end_matches('/');
    let token = std::env::var("TOKEN").map_err(|_| "请设置 TOKEN")?;
    let text = std::env::var("TEXT").unwrap_or_else(|_| "Hello from an open app (Rust)".into());

    let client = reqwest::blocking::Client::new();
    let resp = client
        .post(format!("{instance}/api/notes/create"))
        .bearer_auth(token)
        .json(&json!({ "text": text }))
        .send()?;

    let status = resp.status();
    let body = resp.text()?;
    println!("{status} {body}");
    if !status.is_success() {
        std::process::exit(1);
    }
    Ok(())
}
