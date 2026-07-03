# 设计：个人主页迁移到 al-folio（Jekyll）

- **日期**: 2026-07-03
- **仓库**: `zhshj0110.github.io`（GitHub Pages 用户主站，发布于 https://zhshj0110.github.io）
- **作者**: Shaojie Zhang
- **状态**: Approved

## 1. 目标与范围

将当前手写的单页静态主页（Minimal Mistakes 风格的 `index.html`）替换为官方 **al-folio** Jekyll 主题，迁移全部现有内容，最终仍发布在 `https://zhshj0110.github.io`。

**采用 al-folio 本体（Jekyll），不是静态复刻外观。**

## 2. 现状

- 单个 `index.html` + `assets/css/main.css`（已压缩）+ academicons/fontawesome 字体。
- 直接托管在 GitHub Pages 用户主站，无构建流程。
- 内容分区：About-me、News、Experience、Main Publications、Honors and Awards。
- 本机环境：Homebrew 可用；系统 Ruby 仅 2.6.10（对 al-folio 太旧）；无 Jekyll/Docker/rbenv。

## 3. 内容映射（现有 → al-folio）

| 现有内容 | al-folio 落点 |
|---|---|
| About-me 简介 | `_pages/about.md`（`layout: about`，右侧头像 + 简介，页内嵌 news + selected papers） |
| 头像 `images/ShaojieZhang/ShaojieZhang.png` | `assets/img/prof_pic.png` |
| 社交链接（Email / Github / Google Scholar / 地点 Beijing） | `_config.yml` 的 profile + social 配置 |
| News（4 条） | `_news/*.md`（每条一个文件；首页 about 页自动显示最新几条） |
| Main Publications（4 篇） | `_bibliography/papers.bib`（BibTeX），渲染到 `/publications`；首页显示 selected |
| Experience（3 条） | `_data/cv.yml` → `/cv` 的 Experience 段 |
| Honors and Awards（11 条） | `_data/cv.yml` → `/cv` 的 Honors 段 |

### 已知内容修正
- About 正文第一句 `My name is Liu Jinfu` 是模板残留，改为 **Shaojie Zhang**。
- 导师 Prof. Jianqin Yin、Xiaomi AI Lab 研究实习、研究方向（Multi-modal Large Models / Human Activity Analysis / Human Motion Synthetic）照搬。

## 4. 导航栏

- **启用**：about / publications / cv。
- **关闭**（YAGNI，无对应内容）：blog、projects、teaching、repositories、news 独立页（news 内嵌在 about 页即可）。

## 5. 引入方式

- 下载 al-folio 最新 release，**覆盖进当前仓库**（保留 git 历史，仓库不换）。
- 删除旧文件：`index.html`、旧 `assets/`（旧 css/js/fonts）。保留原始头像与校徽图片，迁入 al-folio 的 `assets/img/`。
- 配置 `_config.yml`：
  - `url: https://zhshj0110.github.io`
  - `baseurl: ""`（用户主站，根路径）
  - 姓名、bio、profile 头像、社交链接、`scholar` 等。

## 6. 部署（GitHub Actions，无本地预览）

- 使用 al-folio 自带的 `.github/workflows/deploy.yml`：push 到 `main` → CI 执行 `bundle install` + `jekyll build` → 发布到 `gh-pages` 分支。
- 首次需在 GitHub 仓库 Settings → Pages 中把 **source 设为 `gh-pages` 分支**（用户在网页手动操作，本设计提供指引）。
- 代价：每次修改需等 CI（约 1–2 分钟）才能在线上看到效果；不做本地预览。
- 推送前保障：因无本地渲染，推送前用 Python/Ruby 校验所有 `_config.yml`、`_data/*.yml` 的 YAML 语法与 `papers.bib` 的 BibTeX 格式，力求一次成功；CI 若失败则读 Actions 日志逐项修复。

## 7. 风险

- **破坏性替换**：旧 `index.html` 被移除。缓解：git 保留全部历史，可随时回退；迁移在独立分支进行。
- **无本地预览**：首次配置错误只能靠 CI 暴露。缓解：推送前静态校验 + 严格照搬 al-folio 官方结构 + CI 失败逐项修。
- **系统 Ruby 过旧**：不影响，因为不在本地构建。

## 8. 成功标准

1. `https://zhshj0110.github.io` 以 al-folio 外观正常渲染。
2. About 页显示正确姓名（Shaojie Zhang）、头像、简介、社交链接、最新 News。
3. `/publications` 正确渲染 4 篇论文（含 Paper/Code 链接）。
4. `/cv` 正确显示 Experience 与 Honors。
5. GitHub Actions 构建通过，Pages 由 `gh-pages` 分支发布。
