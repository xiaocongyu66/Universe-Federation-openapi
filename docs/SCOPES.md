# 常用开放权限（Scope）

创建应用与 OAuth 授权时声明的权限字符串。  
**实例可能只开放其中一部分**；以 `/.well-known/oauth-authorization-server` 的 `scopes_supported` 为准。

## 建议默认申请（示例）

| Scope | 用途 |
|-------|------|
| `read:profile` | 读基本资料 |
| `write:notes` | 发帖 |
| `read:drive` / `write:drive` | 读/写网盘（上传媒体时需要） |
| `read:following` / `write:following` | 关注关系 |
| `read:notifications` / `write:notifications` | 通知 |
| `read:chat` / `write:chat` | 聊天（若实例开放） |

## 更多常见 scope

```
read:account  write:account
read:blocks  write:blocks
read:mutes  write:mutes
read:favorites  write:favorites
read:reactions  write:reactions
read:channels  write:channels
read:pages  write:pages
```

## 不要申请

- 名称中带 **admin** 的权限（管理端，不对第三方开放应用设计）  
- 你业务用不到的写权限  

用户看到权限列表越短，授权率越高。
