# Universe Federation Open API

第三方应用对接 **Universe Federation** 开放 API 的文档与示例。

本仓库只说明**对外开放**的接入方式（OAuth、公开 JSON API），不涉及实例内部实现或管理端接口。

## 你能做什么

- 让用户授权你的应用（OAuth 2.0 + PKCE）
- 用用户令牌调用开放 API（发帖、读资料、网盘等）
- 按实例提供的 OpenAPI 文档生成客户端

## 文档

| 文档 | 说明 |
|------|------|
| [docs/GUIDE.md](./docs/GUIDE.md) | 完整对接指南 |
| [docs/QUICKSTART.md](./docs/QUICKSTART.md) | 最短路径 |
| [docs/SCOPES.md](./docs/SCOPES.md) | 常用权限 scope |
| [docs/ERRORS.md](./docs/ERRORS.md) | 常见错误 |

## 多语言示例

| 语言 | 目录 |
|------|------|
| JavaScript | [examples/js](./examples/js) |
| TypeScript | [examples/ts](./examples/ts) |
| Python | [examples/python](./examples/python) |
| Go | [examples/go](./examples/go) |
| Rust | [examples/rust](./examples/rust) |
| Java | [examples/java](./examples/java) |
| C# | [examples/csharp](./examples/csharp) |
| C++ | [examples/cpp](./examples/cpp) |
| C | [examples/c](./examples/c) |
| cURL | [examples/curl](./examples/curl) |

每个语言目录都包含：

1. **读取实例信息**（无需登录）
2. **Bearer 令牌调用开放 API**（例如创建动态）
3. **OAuth PKCE 辅助**（生成 challenge / 拼授权 URL，按语言能力提供）

## 实例上的公开入口

将 `https://example.com` 换成目标实例：

```text
OpenAPI 文档     GET  /api.json
API 说明页       GET  /api-doc
OAuth 元数据     GET  /.well-known/oauth-authorization-server
开放 API         POST /api/<接口名>
OAuth 授权       GET  /oauth/authorize
OAuth 换票       POST /oauth/token
```

## 三分钟概念

```text
1. 在实例上注册应用（需要开发者账号）
2. 用户通过 OAuth 授权 → 你得到 access_token
3. 请求时带上：
      Authorization: Bearer <access_token>
4. 调用开放接口，例如 POST /api/notes/create
```

开放接口与**站内私有/管理接口**不同：只能使用用户授权过的权限，不能代替管理员后台。

## 拉取目标实例的完整接口列表

```bash
node scripts/fetch-openapi.mjs https://example.com
```

会生成该实例当前版本的 OpenAPI 文件，便于导入 Postman / 生成 SDK。

## 许可

AGPL-3.0-only（与 Universe Federation 生态一致）。调用远端实例时请遵守该实例服务条款。
