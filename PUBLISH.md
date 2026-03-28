
# 资源发布

运行时游戏资源已迁移到 Cloudflare R2，自定义域名为 `https://assets.shatranj.space`。应用壳仍然由 Vercel 构建和部署。

发布或更新资源时执行：

```bash
npm run publish:assets
```

该命令会：

- 计算 `public/assets` 的独立资源版本号
- 同步资源到 R2 bucket `snow-road-web-assets`
- 确保自定义域名和 CORS 配置存在
- 回写 [`src/config/asset-config.json`](/c:/Users/旻/Documents/GitHub/snow-road-web/src/config/asset-config.json) 供前端运行时使用

脚本会从环境变量 `CLOUDFLARE_API_TOKEN` 或 `.env.local` 中的 `CLOUDFLARE_R2_TOKEN` 读取 Cloudflare Token。该 Token 只用于发布流程，不会进入前端构建产物。
