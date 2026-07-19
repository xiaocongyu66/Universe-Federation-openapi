//! 读取实例公开信息
//! 运行: cd examples/rust && cargo run --bin meta
//! 环境变量: INSTANCE=https://example.com

use serde_json::json;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let instance = std::env::var("INSTANCE").unwrap_or_else(|_| "https://example.com".into());
    let instance = instance.trim_end_matches('/');
    let client = reqwest::blocking::Client::new();
    let v: serde_json::Value = client
        .post(format!("{instance}/api/meta"))
        .json(&json!({ "detail": true }))
        .send()?
        .error_for_status()?
        .json()?;
    println!(
        "{}",
        serde_json::json!({
            "name": v.get("name"),
            "version": v.get("version"),
            "uri": v.get("uri"),
        })
    );
    Ok(())
}
