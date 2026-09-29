# 部署方案：访谈用演示站点

> 目标：让 10 位受访者（多数在中国大陆）在访谈中能稳定打开 MVP，并且站点不被公开检索。
> 状态：代码侧已就绪（密码门、noindex、限流、Docker 镜像定义）；**服务器、域名需要你购买**。

## 1. 平台选择

| 方案 | 大陆访问 | 需要 ICP 备案 | 能否调用 Claude API | 成本 | 上手难度 |
|---|---|---|---|---|---|
| **A. 香港轻量服务器 + Docker**（推荐） | 稳定（选对套餐） | 不需要 | **不能**（香港不在 Anthropic 支持地区） | 约 40 元/月 + 域名 | 中 |
| B. Vercel + 自定义域名 | 不稳定：`*.vercel.app` 在大陆受 DNS 污染，需自定义域名并改用 Vercel 的中国线路 CNAME | 不需要 | 能（Vercel 服务器在美国等支持地区） | 免费档可用 + 域名 | 低 |
| C. 新加坡/东京服务器 + Docker | 可用，但晚高峰延迟和丢包较香港明显 | 不需要 | 能 | 约 40–60 元/月 + 域名 | 中 |
| D. 大陆服务器 | 最好 | **需要**，通常要数周 | 不能 | 低 | 高（备案周期） |

**推荐 A**，理由：
- 访谈的核心是测"透明影响分"能否提升信任（访谈提纲 H1、任务二），这部分不依赖 AI；AI 解读在未配置 Key 时使用规则模板，受访者依然能完成任务三。
- 访谈时画面卡顿会直接污染测试结果，大陆访问的稳定性比 AI 解读更重要。

**风险**：规则模板的解读比 Claude 生成的更机械，任务三的反馈会低估 AI 解读的价值。记录时需标注"模板版"。若必须测试真实 AI 解读，改用方案 C，或 B + 自定义域名。

### ⚠️ Claude API 的合规前提（方案 B、C 适用）
- Anthropic 只向支持地区提供 API，**中国大陆和香港不在其中**，服务器必须部署在支持地区。
- 自 2025 年 9 月起，Anthropic 不向 **中国实体持股超过 50%** 的公司提供服务，即使公司注册在海外。若你的公司属于这种情况，不能使用 Claude API，需要另选模型供应商（届时需改造 `lib/ai/brief.ts`）。**这一点需要你确认公司股权结构**。
- 不要通过代理或中转绕过地区限制。

## 2. 代码侧已完成的准备

| 项 | 实现 | 验证 |
|---|---|---|
| 访问密码 | `proxy.ts`：设置 `DEMO_PASSWORD` 后，所有页面和 API 需 HTTP Basic 认证（用户名任意） | 无密码/错密码 401，正确密码 200，API 同样受保护 |
| 禁止收录 | 所有响应带 `X-Robots-Tag: noindex, nofollow`；`/robots.txt` 禁止全部抓取 | 响应头已确认 |
| AI 调用限流 | `/api/brief` 每个 IP 每分钟 10 次 | 第 11 次返回 429 |
| 独立运行包 | `next.config.ts` 启用 `output: "standalone"` | 本地以 `node server.js` 启动，页面与静态资源正常 |
| 容器 | `Dockerfile`（多阶段、非 root 用户）+ `deploy/docker-compose.yml`（应用 + Caddy 自动 HTTPS） | **镜像未在本环境构建成功**：沙箱内容器无法访问 npm，属环境限制；需在服务器上首次构建时确认 |

## 3. 方案 A 操作步骤

### 3.1 购买（你来做）
1. **服务器**：腾讯云轻量应用服务器，地域选**中国香港**，套餐选**锐驰型**（约 40 元/月）。入门套餐不保证跨境网络质量，不要选。系统选 Ubuntu 22.04 或 24.04。
2. **域名**：任意注册商买一个便宜域名（如 `.com` 或 `.top`），实名认证即可，指向香港服务器**不需要备案**。
3. **DNS**：添加一条 A 记录，如 `demo.你的域名` → 服务器公网 IP。
4. **防火墙**：在轻量服务器控制台放行 TCP 80 和 443。

### 3.2 部署（可以交给我写成脚本，或你按以下执行）
```bash
# 登录服务器后
curl -fsSL https://get.docker.com | sh
git clone https://github.com/Jeniffer214/subtrack-v2.git && cd subtrack-v2
cp deploy/.env.example deploy/.env
nano deploy/.env        # 填 DOMAIN 和 DEMO_PASSWORD，ANTHROPIC_API_KEY 留空
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
```
首次启动后，Caddy 会自动申请 HTTPS 证书（需要 DNS 已生效、80/443 已放行）。

### 3.3 上线检查清单
- [ ] 手机 4G（不连 Wi-Fi）打开 `https://demo.你的域名`，弹出密码框
- [ ] 输入密码后能看到日历，点开任一事件、点"生成解读"均正常
- [ ] 晚高峰（20:00–22:00）再测一次打开速度
- [ ] 用浏览器无痕窗口确认：不输密码看不到任何内容
- [ ] 访谈前 1 天把网址和密码发给受访者，并请对方先打开一次，排除公司网络屏蔽

### 3.4 更新与下线
- 更新：`git pull && docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build`
- 访谈结束后：`docker compose -f deploy/docker-compose.yml down`，并在控制台退订服务器，避免续费。

## 4. 已知限制
- 所有受访者共用一个密码；如担心外传，可每批访谈后换密码并重启。
- 限流按 IP 计算，只适合单实例；受访者在同一公司出口 IP 下会共享额度（10 次/分钟，访谈场景够用）。
- Basic 认证在 HTTP 下是明文，**必须**配合 HTTPS 使用（Caddy 已自动处理，不要直接用 IP 访问 3000 端口）。

## 5. 需要你决定
1. 选哪个方案（默认 A）。
2. 公司股权结构是否满足 Claude API 的使用条件（影响后续正式版的模型选型）。
3. 买好服务器和域名后，告诉我域名，我可以帮你把部署步骤写成一键脚本并复核配置。

## 来源
- Vercel 在大陆的访问问题：[程序猿DD](https://www.didispace.com/article/20230917-vercel-china-dns.html)、[V2EX 讨论](https://www.v2ex.com/t/972345)
- Anthropic 支持地区：[官方列表](https://www.anthropic.com/supported-countries)、[API 支持地区文档](https://anthropic.mintlify.app/en/api/supported-regions)、[地区与股权政策整理](https://blog.eimoon.com/p/anthropic-supported-countries-regions-2026-04/)
- 香港服务器免备案与腾讯云套餐：[腾讯云开发者社区对比](https://cloud.tencent.com/developer/article/2657269)、[腾讯云轻量服务器](https://cloud.tencent.com/product/lighthouse)
- Next.js 16 `proxy.ts`：[官方文档](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
