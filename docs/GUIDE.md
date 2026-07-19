# Universe Federation 开放 API 对接指南

面向要开发**开放应用**的第三方：网站、机器人、桌面/移动客户端、跨站工具。

本文只描述**对外开放**能力，不包括实例内部运维、管理后台或未公开接口。

---

## 1. 基本约定

### 1.1 实例地址

下文用：

```text
https://example.com
```

请换成用户实际使用的 Universe Federation 实例域名。

### 1.2 开放 API 基址

```text
https://example.com/api/<接口名>
```

- 方法：多数为 **POST**，`Content-Type: application/json`
- 鉴权（二选一，推荐第一种）：

```http
Authorization: Bearer <access_token>
```

```json
{ "i": "<access_token>", "...业务字段" }
```

### 1.3 哪些算「开放 API」

| 属于开放对接 | 不属于开放对接（本文不讲） |
|--------------|---------------------------|
| 用户授权后的读写（资料、动态、网盘、关注等） | 管理员后台接口 |
| OAuth 授权与换票 | 服务器内部 RPC / 运维接口 |
| 实例公开元数据 | 未在 `/api.json` 中对第三方公开的路径 |
| 实例提供的 OpenAPI 文档 | 数据库、队列、联邦底层细节 |

**原则**：只调用用户明确授权、且出现在实例 `/api.json` 中的接口；不要猜测或扫描内部路径。

### 1.4 实例是否允许第三方

实例管理员可选择：

- **开放**：符合权限的应用可直接用
- **需审批**：部分权限要管理员通过
- **关闭**：第三方令牌无法调用

若接口返回「API 已关闭 / 需要审批」类错误，请引导用户联系实例管理员，或缩小申请的权限。

---

## 2. 对接流程总览

```text
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│ 注册应用     │ --> │ 用户 OAuth   │ --> │ 带 Token 调 API │
│ (名称/回调/  │     │ 授权 + PKCE  │     │ 只访问已授权范围 │
│  权限列表)   │     │ 获得 token   │     │                │
└─────────────┘     └──────────────┘     └────────────────┘
```

1. **注册应用**：拿到 `client_id`、`client_secret`、配置回调 URL  
2. **OAuth 授权**：用户同意后拿到 `access_token`  
3. **调用开放 API**：只请求已申请且用户批准的权限  

---

## 3. 发现与文档

### 3.1 OpenAPI（推荐）

```http
GET https://example.com/api.json
```

返回 **OpenAPI 3.1** 文档，列出该实例当前对外接口、参数与是否需要登录。

人类可读页面：

```http
GET https://example.com/api-doc
```

### 3.2 OAuth 元数据

```http
GET https://example.com/.well-known/oauth-authorization-server
```

常见字段：

| 字段 | 含义 |
|------|------|
| `issuer` | 发行方（实例根 URL） |
| `authorization_endpoint` | 授权页，通常 `/oauth/authorize` |
| `token_endpoint` | 换票地址，通常 `/oauth/token` |
| `scopes_supported` | 可申请的权限列表 |
| `code_challenge_methods_supported` | 含 `S256`（必须用 PKCE） |

---

## 4. 注册开放应用

使用**已登录开发者账号**创建应用（接口名以实例 `/api.json` 为准，一般为创建 App 类接口）。

需要提供：

| 字段 | 说明 |
|------|------|
| 应用名称 | 显示给用户 |
| 简介 | 用途说明 |
| 权限列表 | 如 `read:profile`、`write:notes`（见 [SCOPES.md](./SCOPES.md)） |
| 回调 URL | 必须 **HTTPS**（本机开发可用 `http://127.0.0.1` / `localhost`） |

保存返回的：

- **Client ID**
- **Client Secret**（仅放在你的服务端，不要写进前端公开仓库）

只申请业务真正需要的权限，用户更愿意授权。

---

## 5. OAuth 2.0（开放应用标准流程）

支持：**授权码模式 + PKCE（S256，必选）**。  
不支持：密码模式、隐式模式、无 PKCE 的旧流程。

### 5.1 生成 PKCE

```text
code_verifier  = 随机高熵字符串（建议 43–128 字符）
code_challenge = BASE64URL( SHA256(code_verifier) )
code_challenge_method = S256
```

### 5.2 跳转授权页

```text
GET https://example.com/oauth/authorize
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://your-app.example/oauth/callback
  &scope=read:profile%20write:notes
  &state=随机防 CSRF
  &code_challenge=...
  &code_challenge_method=S256
```

用户登录并同意后，浏览器回到你的 `redirect_uri`，带上 `code` 与 `state`。  
请校验 `state` 与发起时一致。

### 5.3 用授权码换 access_token

```http
POST https://example.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&code=授权码
&code_verifier=刚才的 verifier
&redirect_uri=https://your-app.example/oauth/callback
```

成功时大致返回：

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "scope": "read:profile write:notes",
  "created_at": 1710000000
}
```

### 5.4 使用令牌

```http
POST https://example.com/api/i
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{}
```

---

## 6. 常用开放接口示例

> 参数以目标实例 `/api.json` 为准；下列为最常见约定。

### 6.1 实例信息（可不登录）

```http
POST /api/meta
Content-Type: application/json

{ "detail": true }
```

### 6.2 当前用户

```http
POST /api/i
Authorization: Bearer <token>
Content-Type: application/json

{}
```

### 6.3 发帖

```http
POST /api/notes/create
Authorization: Bearer <token>
Content-Type: application/json

{ "text": "Hello from my open app" }
```

需要权限：`write:notes`。

### 6.4 其他

在 `/api.json` 中按标签查找，例如：

- 关注 / 拉黑 / 通知 / 网盘 / 频道 / 聊天等  
- 每个接口会标注是否需要登录、需要哪些权限  

**不要**调用名称像管理员、运维、内部队列一类的接口——即使用户是管理员，开放应用也不应依赖这些能力。

---

## 7. 响应与限流

### 7.1 成功

- 有数据：`200` + JSON  
- 无正文：`204`

### 7.2 业务错误

```json
{
  "error": {
    "message": "人类可读说明",
    "code": "ERROR_CODE",
    "id": "稳定 UUID"
  }
}
```

见 [ERRORS.md](./ERRORS.md)。

### 7.3 限流

可能出现：

```http
Retry-After: 2
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1.5
```

请降低频率，并在 `Retry-After` 之后重试。

---

## 8. 安全清单（开放应用必读）

1. **Client Secret 只放服务端**  
2. **必须使用 PKCE S256**  
3. **校验 OAuth `state`**  
4. **回调仅使用白名单 HTTPS 地址**  
5. **最小权限原则**  
6. **安全存储 access_token**（系统钥匙串 / 服务端会话，避免明文塞进前端仓库）  
7. **提供「断开连接 / 撤销授权」说明**，尊重用户取消授权  
8. **禁止**向用户索要密码或「账户原生令牌」；只走 OAuth  

---

## 9. 多语言示例

见仓库 [`examples/`](../examples/) 目录：JS / TS / Python / Go / Rust / Java / C# / C++ / C / cURL。

每个示例都只演示开放对接三件事：读公开信息、带 Bearer 调 API、PKCE 相关辅助。

---

## 10. 推荐集成步骤

1. 对目标实例 `GET /api.json`，确认版本与接口  
2. 注册应用，配置回调与最小 scope  
3. 实现 OAuth + PKCE  
4. 先调 `/api/i` 验证令牌  
5. 再调业务接口  
6. 处理错误码与限流  
7. 上线前检查 Secret 未泄露  

---

## 11. 不在本文范围

- 实例源码结构、部署与运维  
- 管理后台、审核、系统队列  
- ActivityPub 联邦协议细节（与「应用开放 API」不同层）  
- 未文档化的实验接口  

若你需要的是**用户可授权的应用能力**，请只使用本指南与实例 `/api.json` 中的开放接口。
