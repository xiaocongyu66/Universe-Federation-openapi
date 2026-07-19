# OpenAPI 文件说明

| 文件 | 用途 |
|------|------|
| `openapi.base.yaml` | 开放对接骨架（发现、OAuth、几个示例接口） |
| `api.<域名>.json` | 用脚本从**真实实例**拉取的完整开放接口列表 |

```bash
node scripts/fetch-openapi.mjs https://你的实例
```

导入 Postman / Apifox / openapi-generator 时，优先使用拉取到的完整 JSON。
