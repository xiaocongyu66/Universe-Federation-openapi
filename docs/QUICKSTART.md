# 最短对接路径

## 1. 看实例是否开放

```bash
curl -sS https://example.com/.well-known/oauth-authorization-server
curl -sS https://example.com/api.json | head -c 400
```

## 2. 注册应用

在实例网站用开发者账号创建应用，填写：

- 名称、简介  
- 回调：`https://你的域名/oauth/callback`  
- 权限：尽量少，例如 `read:profile` `write:notes`  

得到 `client_id`、`client_secret`。

## 3. 用户授权（OAuth + PKCE）

1. 生成 `code_verifier` / `code_challenge`（S256）  
2. 打开授权页（见 [GUIDE.md](./GUIDE.md)）  
3. 回调拿到 `code`  
4. `POST /oauth/token` 换 `access_token`  

各语言示例见 `examples/`。

## 4. 调开放 API

```bash
curl -sS -X POST https://example.com/api/notes/create \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello"}'
```

完成。更细的说明见 [GUIDE.md](./GUIDE.md)。
