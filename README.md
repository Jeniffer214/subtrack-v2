# Printlens 澄数

透明可验证的 AI 经济日历，对标 [GoMoon.ai](https://gomoon.ai/)。调研与决策清单见 [`docs/RESEARCH.md`](docs/RESEARCH.md)。

> ⚠️ 当前只接入了**演示数据**（程序合成，非真实行情与日程），不得用于交易。

## 功能（MVP）

- **经济日历**：按周浏览；按国家、最低影响分筛选；按浏览器/自选时区显示（DST 自动处理）；倒计时
- **关注资产**：选择你交易的品种，影响分只按这些品种计算
- **透明影响分**：`clamp(round(2 × 发布后1h波动中位数 ÷ 平时1h波动), 1, 10)`，每个资产都显示输入值与样本量
- **意外度**：`(实际 − 预期) ÷ 历史意外标准差`，以 σ 表示
- **敏感度**：意外度 z 对 1h 反应的最小二乘斜率、R²、方向命中率（|z| ≥ 0.5）
- **AI 解读**：Claude 仅基于上述统计写中文要点，不做预测、不给交易建议；未配置 Key 时使用规则模板

## 运行

```bash
npm install
cp .env.example .env.local   # 可选：填入 ANTHROPIC_API_KEY 启用 Claude 解读
npm run dev                  # http://localhost:3000
npm test                     # 单元测试
npm run typecheck
```

## 结构

| 路径 | 说明 |
|---|---|
| `lib/analytics.ts` | 影响分、意外度、敏感度、命中率 |
| `lib/data/provider.ts` | 数据源接口 `CalendarProvider`（接真实数据时实现它） |
| `lib/data/demo-provider.ts` | 确定性合成数据 |
| `lib/data/catalog.ts` | 事件与资产目录 |
| `lib/ai/brief.ts` | Claude 解读（服务端重新计算统计，客户端只传事件 ID） |
| `app/` | Next.js 页面与 `/api/brief` |

## 已知限制

- 影响分用中位数，对"多数时候符合预期、偶尔大幅意外"的央行决议会偏低（演示中美联储为 7）。是否改为分位数/加权，见调研文档决策点。
- 周视图按 UTC 周切分。
- AI 解读缓存在进程内存，多实例部署需换成共享缓存。
