# 常见错误（开放对接）

开放 API 错误体一般形如：

```json
{
  "error": {
    "message": "...",
    "code": "SOME_CODE",
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

OAuth 端点可能使用：

```json
{
  "error": "invalid_request",
  "error_description": "..."
}
```

## 对接时常见 code / 情况

| 情况 | 可能原因 | 建议 |
|------|----------|------|
| 未授权 / 401 | token 无效、过期、撤销 | 重新走 OAuth |
| 权限不足 | scope 不够 | 重新授权并申请对应 scope |
| API 已关闭 | 实例禁止第三方 | 换实例或联系管理员 |
| 需要审批 | 实例为审批模式 | 等待管理员通过，或只用免审权限 |
| 回调地址非法 | 非 HTTPS 或不在白名单 | 改回调配置 |
| PKCE 失败 | challenge/verifier 不一致 | 检查 S256 实现 |
| 限流 429 | 请求过快 | 按 `Retry-After` 退避 |
| 参数错误 | JSON 字段不对 | 对照 `/api.json` |

展示给用户时优先用 `message`；日志可记 `code` 与 `id` 便于排查。
