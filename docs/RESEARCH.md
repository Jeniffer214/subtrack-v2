# 竞品调研与产品方案：AI 经济日历（对标 GoMoon.ai）

> 调研日期：2026-09-29 ｜ 状态：**待决策**（每个「🟡 决策点」需要你拍板）
> 说明：部分竞品官网被本环境网络策略拦截，以下信息来自搜索引擎摘要与第三方评测，未能逐一核实官网定价，已在表格中标注。

## 1. 对标对象：GoMoon.ai

| 项目 | 内容 |
|---|---|
| 定位 | 面向日内/外汇/期货/股票交易员的 **AI 经济日历** |
| 公司 | 韩国首尔，2024 年成立，未融资（Tracxn） |
| 核心功能 | 事件影响评分 1–10、可定制日历、实时事件直播、历史事件回放 + TradingView 图表、按国家/类别/影响等级提醒（邮件/推送）、AI 事后摘要、5m/15m/1h/4h 市场反应测量、财报日历 |
| 商业模式 | Free（基础日历）+ Pro（AI 洞察、高级功能）；**具体价格未能核实** |
| 第三方质疑 | 预测缺乏独立的业绩验证数据；安全与合规信息公开不足 |

## 2. 同类产品全景

| 产品 | 类型 | 核心卖点 | 主要短板 | 价格 |
|---|---|---|---|---|
| Forex Factory | 免费日历 + 论坛 | 行业默认标准，颜色影响等级，actual 秒级更新 | 影响等级**临时改动且不透明**；默认美东时区易出错；社区氛围差；无 AI | 免费 |
| Investing.com | 日历 + 行情门户 | 事件覆盖最全，App 推送好 | 广告多、信息过载；无"为什么重要"的解释 | 免费/付费去广告 |
| Trading Economics | 宏观数据库 | 196 国，历史数据深，API | 面向分析师，交易场景弱；API 贵 | 免费 / $39 / $119 / $499 月 |
| FXStreet | 日历 + 分析师评论 | 解读内容丰富 | 人工内容，时效与覆盖受限 | 免费 |
| EconCalendar.ai | AI 日历 | 1–10 评分、受影响资产、历史命中率、财报与宏观叠加 | 与 GoMoon 高度同质化 | Pro（未核实） |
| Horaizon | AI 日历 | 受影响资产识别、个性化提醒 | 同质化 | 未核实 |
| SignalPro | FF 替代 | 快、无广告、AI 信号 | "信号"属投资建议，合规风险高 | 未核实 |
| Forex News 等 App | 移动端 | AI 一句话摘要 | 深度不足 | 免费/订阅 |
| 金十数据 / 华尔街见闻 | 中文快讯 + 日历 | 中文市场垄断级流量、7×24 快讯 | 日历只是"时间表"，缺少**量化的历史反应统计**；按日查快讯等为 VIP | 免费 + VIP |

## 3. 用户痛点（按证据强度排序）

| # | 痛点 | 证据来源 | 置信度 |
|---|---|---|---|
| P1 | **影响评分是黑箱**，且会临时修改（FF 用户称因此亏损） | Trustpilot / 评测 | 高 |
| P2 | **看 actual 不看预期差**：真正驱动行情的是 actual 与共识的偏离，多数日历不算"意外程度" | 多篇交易教程一致强调 | 高 |
| P3 | **时区/夏令时错误**导致错过事件，是"最常被提到的原因" | 交易教程 | 高 |
| P4 | 数据延迟、不完整、错误 | MQL5 论坛 | 中 |
| P5 | 信息过载：几百个事件，不知道哪些和"我持仓的品种"相关 | 各 AI 日历均以"个性化"为卖点，侧面印证 | 中 |
| P6 | AI 预测**没有可验证的业绩记录**，用户不信任 | GoMoon 第三方评测 | 中 |
| P7 | 中文用户：英文 AI 日历无中文；中文平台有日历无量化分析 | 竞品功能对比推断 | 中（**推断，需验证**） |

## 4. 我们的差异化定位（建议）

**一句话：可验证的 AI 经济日历——每个分数都能展开看到计算过程和样本量。**

| 痛点 | 我们的方案 | MVP 已实现 |
|---|---|---|
| P1 黑箱评分 | **透明影响分**：基于该事件历史发布后 1h 波动 ÷ 该资产平时 1h 波动，公式与样本量 n 全部公开 | ✅ |
| P2 预期差 | **意外度 z-score**：(actual − 预期) ÷ 历史意外标准差，并给出"每 1σ 意外，资产历史平均反应 X bp（R²、n）" | ✅ |
| P3 时区 | 全部 UTC 存储、按浏览器时区显示并标注时区名，倒计时 | ✅ |
| P4 延迟 | 显示数据源与更新时间戳；接入付费实时源放到 V2 | ⚠️ 仅接口 |
| P5 过载 | **持仓品种关注列表**：只看影响你关注资产的事件 | ✅ |
| P6 不可信 | AI 只做**基于统计数据的解读**，不做方向预测/不给买卖信号；每句结论引用具体数字 | ✅ |
| P7 中文 | 中文优先、双语事件名，覆盖中国数据（CPI、PMI、LPR）+ 离岸人民币 | ✅（中文 UI） |

### 优势
- 透明性是 GoMoon/EconCalendar 等都没有强调的空位，且**可以作为营销主张**（"我们公开算法"）。
- 不做"信号"，合规风险显著低于 SignalPro 类产品。
- 中文市场：金十/见闻有流量但缺量化工具，存在切入空间。

### 劣势 / 风险
- **数据是生命线**：实时 actual 与共识预期需付费数据源（Trading Economics API $119+/月起；FMP / Finnhub 需付费档）。抓取 Investing.com 等存在法律与稳定性风险。
- 历史反应统计需要分钟级行情数据（额外成本）。
- 透明评分可被竞品抄袭，护城河在数据质量与中文体验，而非算法本身。
- 中国大陆涉及外汇/证券"投资咨询"的合规边界需法律意见（**不要给出买卖建议**是底线）。
- AI 调用成本：每次解读约数千 token，需缓存（同一事件的解读对所有用户共享）。

## 5. MVP 范围（本分支已实现）

- 周视图经济日历：国家/影响分/关注资产筛选、本地时区、倒计时
- 事件详情页：历史发布表、意外度、每个资产的透明影响分、意外—反应散点图、回归敏感度
- AI 解读（Claude API）：输入为结构化统计数据，输出中文要点；无 API Key 时退回规则模板
- **演示数据**：确定性生成的合成数据，UI 明确标注"演示数据"，**不得用于交易**
- 数据源抽象层 `CalendarProvider`，后续可替换为真实数据源

## 6. 🟡 需要你决策的事项

| # | 决策点 | 选项 | 我的建议 |
|---|---|---|---|
| D1 | 产品名 | ✅ 已定：Printlens / 澄数（原占位名 MacroPulse 与 macropulse.com 等同赛道产品冲突，已弃用） | 注册前仍需查中国商标网第 9/36/42 类、USPTO/WIPO 及域名 |
| D2 | 目标市场 | A 中文优先 / B 英文全球 / C 双语 | **A**：差异化最明显，竞争最弱（置信度：中，依据是竞品功能对比，缺用户访谈） |
| D3 | 数据源 | Trading Economics / FMP / Finnhub / 自建抓取 | 先用 FMP 或 TE 入门档验证付费意愿，**不建议抓取** |
| D4 | 平台 | Web / 移动 App / TradingView 插件 | Web 先行（PWA 推送），验证后再做 App |
| D5 | 商业模式 | 免费+Pro 订阅 / 券商 B2B 白标 | 免费日历 + Pro（AI 解读、提醒、历史统计）；券商白标作为第二曲线 |
| D6 | 下一步 | 用户访谈 10 人 / 直接接真实数据 | 先 10 人访谈验证 P7，再投入数据成本（提纲见 [INTERVIEW_GUIDE.md](INTERVIEW_GUIDE.md)） |

## 来源
- [GoMoon.ai 官网](https://gomoon.ai/) ｜ [Tracxn 公司档案](https://tracxn.com/d/companies/gomoon/__5a5r6q3oQxC8fDfEck63Mmx-DwcfRbPLy3Pa8KZ3v-A) ｜ [MOGE 介绍](https://moge.ai/product/gomoonai) ｜ [BestAITools 评测](https://www.bestaitools.com/tool/gomoon-ai/) ｜ [GoMoon 评测文章](https://gomoon.pages.dev/posts/gomoon/)
- [Forex Factory Trustpilot](https://www.trustpilot.com/review/forexfactory.com) ｜ [MQL5：日历延迟、不完整、错误](https://www.mql5.com/en/forum/331554)
- [Top 11 Forex Calendars 2026](https://www.earnforex.com/guides/top-forex-calendars/) ｜ [12 Best Economic Calendars 2026](https://work-club.com/best-economic-calendars-traders-2026/) ｜ [Forex News vs FF vs Investing](https://amanblaze.in/blog/forex-news-vs-forex-factory-investing-calendar) ｜ [SignalPro](https://signalpro.markets/forex-factory-alternative)
- [EconCalendar.ai](https://www.econcalendar.ai/) ｜ [Horaizon](https://www.horaizon.app/) ｜ [Chartical](https://en.chartical.com/chartical-ai-economic-calendar/)
- [Trading Economics API 定价](https://tradingeconomics.com/api/pricing.aspx) ｜ [Finnhub 经济数据 API](https://finnhub.io/pricing-economic-data-api) ｜ [FMP 经济日历 API](https://site.financialmodelingprep.com/developer/docs/economic-calendar-api)
- [金十数据财经日历](https://rili.jin10.com/) ｜ [华尔街见闻](https://wallstreetcn.com/)
