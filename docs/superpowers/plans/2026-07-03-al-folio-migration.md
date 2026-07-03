# al-folio Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用官方 al-folio Jekyll 主题替换现有手写单页主页，迁移全部内容，经 GitHub Actions 构建后发布在 https://zhshj0110.github.io。

**Architecture:** 把 al-folio 最新 release 覆盖进现有仓库，删除旧静态文件，用 `_config.yml` + Markdown 页面 + `_news/` + `_bibliography/papers.bib` + `_data/cv.yml` 承载内容。不在本地构建，改动 push 到 `feature/al-folio-migration` → 合并 `main` 后由 al-folio 自带 GitHub Action 构建并发布到 `gh-pages` 分支。

**Tech Stack:** Jekyll, al-folio theme, jekyll-scholar (BibTeX), GitHub Actions, GitHub Pages。

## Global Constraints

- 仓库：`zhshj0110.github.io`（GitHub Pages 用户主站）。
- `_config.yml`：`url: https://zhshj0110.github.io`，`baseurl: ''`。
- 姓名统一 **Shaojie Zhang**（修掉模板残留 "Liu Jinfu"）。
- 导航仅启用：**about / publications / cv**；其余页面 `nav: false`。
- 无本地 Jekyll——每个内容任务在 commit 前用 `python3 -c "import yaml,..."` 校验 YAML；bib 用语法检查。
- 所有工作在分支 `feature/al-folio-migration` 上进行（已创建，spec 已提交）。
- 保留原始头像 `images/ShaojieZhang/ShaojieZhang.png` 与校徽 `images/Schools/BUPT.*`。

## File Structure

- `Gemfile`, `_config.yml`, `_layouts/`, `_includes/`, `_sass/`, `assets/` — 来自 al-folio release（覆盖引入）。
- `.github/workflows/deploy.yml` — al-folio 自带 CI（覆盖引入）。
- `_pages/about.md` — 首页（about layout，含 news + selected papers）。
- `_pages/publications.md`, `_pages/cv.md` — al-folio 自带，仅需保留 nav。
- `_news/announcement_1..4.md` — 新闻条目。
- `_bibliography/papers.bib` — 4 篇论文。
- `_data/cv.yml` — Experience + Honors。
- `assets/img/prof_pic.png` — 头像。
- 删除：旧 `index.html`、`assets/css/`、`assets/js/`、`assets/fonts/`（被 al-folio 的 assets 取代）。

---

### Task 1: 引入 al-folio 骨架并清理旧文件

**Files:**
- Create: 整个 al-folio 目录树（`Gemfile`, `_config.yml`, `_layouts/`, `_includes/`, `_sass/`, `_pages/`, `_plugins/`, `assets/`, `.github/workflows/deploy.yml` 等）
- Delete: `index.html`, `assets/css/`, `assets/js/`, `assets/fonts/`（旧的）
- Keep: `images/`, `README.md`, `docs/`, `.git/`

**Interfaces:**
- Produces: al-folio 标准目录结构，供后续任务填内容。关键路径：`_config.yml`、`_pages/about.md`、`_bibliography/papers.bib`、`_data/cv.yml`、`assets/img/`。

- [ ] **Step 1: 下载 al-folio 最新 release 到临时目录**

```bash
cd /Users/zsj/Documents/work/HomePage
TMP=$(mktemp -d)
curl -fsSL https://github.com/alshedivat/al-folio/archive/refs/heads/main.tar.gz -o "$TMP/alfolio.tar.gz"
tar -xzf "$TMP/alfolio.tar.gz" -C "$TMP"
ls "$TMP"/al-folio-main | head -40
echo "$TMP" > /tmp/alfolio_src_path.txt
```
Expected: 列出 `_config.yml`, `Gemfile`, `_layouts`, `_pages`, `_bibliography`, `_data`, `assets`, `.github` 等。

- [ ] **Step 2: 删除旧静态文件**

```bash
cd /Users/zsj/Documents/work/HomePage
git rm -q index.html
git rm -rq assets/css assets/js assets/fonts
ls assets 2>/dev/null || echo "assets removed"
```
Expected: 旧 `index.html` 与 `assets/{css,js,fonts}` 从工作区移除。

- [ ] **Step 3: 覆盖引入 al-folio 文件（不覆盖 images/docs/README/.git）**

```bash
cd /Users/zsj/Documents/work/HomePage
SRC="$(cat /tmp/alfolio_src_path.txt)/al-folio-main"
rsync -a \
  --exclude='.git' --exclude='README.md' --exclude='docs' \
  --exclude='images' --exclude='CHANGELOG.md' \
  "$SRC"/ ./
ls -a | head -40
test -f _config.yml && test -f Gemfile && test -d _layouts && echo "SKELETON OK"
```
Expected: `SKELETON OK`，仓库根出现 al-folio 文件。

- [ ] **Step 4: 移入头像**

```bash
cd /Users/zsj/Documents/work/HomePage
mkdir -p assets/img
cp images/ShaojieZhang/ShaojieZhang.png assets/img/prof_pic.png
test -f assets/img/prof_pic.png && echo "PROF PIC OK"
```
Expected: `PROF PIC OK`。

- [ ] **Step 5: 校验 al-folio `_config.yml` 可被 YAML 解析**

```bash
cd /Users/zsj/Documents/work/HomePage
python3 -c "import yaml; yaml.safe_load(open('_config.yml')); print('CONFIG YAML OK')"
```
Expected: `CONFIG YAML OK`（al-folio 的 _config.yml 是纯 YAML，safe_load 应通过）。

- [ ] **Step 6: Commit**

```bash
cd /Users/zsj/Documents/work/HomePage
git add -A
git commit -m "feat: scaffold al-folio theme, remove legacy static site"
```

---

### Task 2: 配置 `_config.yml` 身份与站点信息

**Files:**
- Modify: `_config.yml`

**Interfaces:**
- Consumes: Task 1 引入的 al-folio `_config.yml`。
- Produces: 正确的 `url`/`baseurl`/姓名/社交，供 about 页头像自动加粗作者名等使用（al-folio 依据 `first_name`+`last_name` 自动加粗 bib 中作者）。

- [ ] **Step 1: 编辑站点基础字段**

在 `_config.yml` 中设置（逐键查找替换，保持其余默认）：

```yaml
first_name: Shaojie
middle_name:
last_name: Zhang

url: https://zhshj0110.github.io
baseurl: ""

description: Personal homepage of Shaojie Zhang.
keywords: Shaojie Zhang, BUPT, action recognition, human pose estimation
```

- [ ] **Step 2: 配置社交与联系方式**

在 `_config.yml` 的社交区块设置（其余 username 置空）：

```yaml
email: zsj@bupt.edu.cn
github_username: zhshj0110
scholar_userid: kcZH8esAAAAJ
```

在 profile/social 显示开关处保留 email、github、google scholar 为可见。

- [ ] **Step 3: 校验 YAML**

```bash
cd /Users/zsj/Documents/work/HomePage
python3 -c "import yaml; c=yaml.safe_load(open('_config.yml')); print('URL', c.get('url')); print('BASEURL repr', repr(c.get('baseurl'))); print('NAME', c.get('first_name'), c.get('last_name'))"
```
Expected: `URL https://zhshj0110.github.io`、`BASEURL repr ''`、`NAME Shaojie Zhang`。

- [ ] **Step 4: Commit**

```bash
git add _config.yml
git commit -m "feat: configure site identity, url, and social links"
```

---

### Task 3: About 首页内容 + 头像

**Files:**
- Modify: `_pages/about.md`

**Interfaces:**
- Consumes: `assets/img/prof_pic.png`（Task 1），`_config.yml` 社交（Task 2）。
- Produces: 首页正文；`news: true` 与 `selected_papers: true` 供 Task 4/5 渲染。

- [ ] **Step 1: 写入 about front matter 与正文**

将 `_pages/about.md` 替换为：

```markdown
---
layout: about
title: about
permalink: /
subtitle: Intelligent Cognitive Systems Lab (iCOST), Beijing University of Posts and Telecommunications (BUPT).

profile:
  align: right
  image: prof_pic.png
  image_circular: false
  more_info: >
    <p>Beijing, China</p>

news: true
selected_papers: true
social: true
---

My name is Shaojie Zhang, a master student in [Beijing University of Posts and Telecommunications](https://www.bupt.edu.cn/), supervised by Prof. [Jianqin Yin](https://teacher.bupt.edu.cn/yinjianqin/zh_CN/index.htm).

Before that, I received my B.S. degree in [Beijing University of Posts and Telecommunications](https://www.bupt.edu.cn/).

I am also a research intern in [Xiaomi AI Lab](https://www.mi.com/miai).

My research interests include **Multi-modal Large Models**, **Human Activity Analysis** and **Human Motion Synthetic**.
```

- [ ] **Step 2: 校验 front matter YAML**

```bash
cd /Users/zsj/Documents/work/HomePage
python3 - <<'PY'
import yaml
txt=open('_pages/about.md').read()
fm=txt.split('---')[1]
d=yaml.safe_load(fm)
assert d['layout']=='about' and d['news'] and d['selected_papers'], d
print('ABOUT FM OK; name in body:', 'Shaojie Zhang' in txt, '; no Liu Jinfu:', 'Liu Jinfu' not in txt)
PY
```
Expected: `ABOUT FM OK; name in body: True ; no Liu Jinfu: True`。

- [ ] **Step 3: Commit**

```bash
git add _pages/about.md
git commit -m "feat: about page content (Shaojie Zhang) with profile photo"
```

---

### Task 4: News 条目

**Files:**
- Delete: al-folio 自带的 `_news/announcement_*.md` 示例
- Create: `_news/announcement_1.md` .. `_news/announcement_4.md`

**Interfaces:**
- Consumes: `news: true`（Task 3）。
- Produces: about 页顶部的 News 列表（按日期倒序）。

- [ ] **Step 1: 删除示例 news**

```bash
cd /Users/zsj/Documents/work/HomePage
rm -f _news/announcement_*.md
```

- [ ] **Step 2: 写入 4 条 news（inline）**

`_news/announcement_1.md`:
```markdown
---
layout: post
date: 2024-06-01 00:00:00
inline: true
---
🎉 CVPR 2024 AVA Accessibility Vision and Autonomy Challenge #Keypoint Track **Champion** Solution.
```

`_news/announcement_2.md`:
```markdown
---
layout: post
date: 2024-04-01 00:00:00
inline: true
---
🎉 One paper is accepted by TCSVT 2024.
```

`_news/announcement_3.md`:
```markdown
---
layout: post
date: 2024-01-01 00:00:00
inline: true
---
🎉 One paper is accepted by PR 2024.
```

`_news/announcement_4.md`:
```markdown
---
layout: post
date: 2023-06-01 00:00:00
inline: true
---
🎉 CVPR 2023 AVA Accessibility Vision and Autonomy Challenge #Keypoint Track Second Place Solution.
```

- [ ] **Step 3: 校验每个 news front matter**

```bash
cd /Users/zsj/Documents/work/HomePage
python3 - <<'PY'
import yaml, glob
for f in sorted(glob.glob('_news/announcement_*.md')):
    fm=open(f).read().split('---')[1]
    d=yaml.safe_load(fm)
    assert d['inline'] is True and d['date'], (f,d)
    print('OK', f, d['date'])
PY
```
Expected: 4 行 `OK ... <date>`。

- [ ] **Step 4: Commit**

```bash
git add _news
git commit -m "feat: news announcements"
```

---

### Task 5: Publications（BibTeX）

**Files:**
- Modify: `_bibliography/papers.bib`（替换 al-folio 示例内容）

**Interfaces:**
- Consumes: `selected_papers: true`（Task 3）；`first_name`/`last_name`（Task 2，用于自动加粗）。
- Produces: `/publications` 页面 + about 页 selected papers（标 `selected={true}` 的条目）。

- [ ] **Step 1: 写入 4 篇论文的 BibTeX**

将 `_bibliography/papers.bib` 全部替换为：

```bibtex
@article{zhang2024sitmlp,
  abbr={TCSVT},
  title={SiT-MLP: A Simple MLP with Point-wise Topology Feature Learning for Skeleton-based Action Recognition},
  author={Zhang, Shaojie and Yin, Jianqin and Dang, Yonghao},
  journal={IEEE Transactions on Circuits and Systems for Video Technology (TCSVT), CCF B},
  year={2024},
  selected={true},
  html={https://ieeexplore.ieee.org/document/10495051},
  code={https://github.com/zhshj0110/SiT-MLP}
}

@article{dang2024kinematics,
  abbr={PR},
  title={Kinematics Modeling Network for Video-based Human Pose Estimation},
  author={Dang, Yonghao and Yin, Jianqin and Zhang, Shaojie and Liu, Jiping and Hu, Yanzhu},
  journal={ELSEVIER Pattern Recognition (PR), CCF B},
  year={2024},
  html={https://www.sciencedirect.com/science/article/pii/S0031320324000384}
}

@article{dang2022relation,
  abbr={TIP},
  title={Relation-Based Associative Joint Location for Human Pose Estimation in Videos},
  author={Dang, Yonghao and Yin, Jianqin and Zhang, Shaojie},
  journal={IEEE Transactions on Image Processing (TIP), CCF B},
  year={2022},
  html={https://ieeexplore.ieee.org/document/9786543}
}

@article{zhang2023spatial,
  abbr={arXiv},
  title={Spatial-Temporal Decoupling Contrastive Learning for Skeleton-based Human Action Recognition},
  author={Zhang, Shaojie and Yin, Jianqin and Dang, Yonghao},
  journal={arXiv preprint arXiv:2312.15144},
  year={2023},
  selected={true},
  html={https://arxiv.org/abs/2312.15144}
}
```

- [ ] **Step 2: 语法检查（花括号平衡 + 条目数）**

```bash
cd /Users/zsj/Documents/work/HomePage
python3 - <<'PY'
s=open('_bibliography/papers.bib').read()
assert s.count('{')==s.count('}'), (s.count('{'), s.count('}'))
n=s.count('@article')
assert n==4, n
assert 'Zhang, Shaojie' in s
print('BIB OK: entries', n, 'braces balanced')
PY
```
Expected: `BIB OK: entries 4 braces balanced`。

- [ ] **Step 3: Commit**

```bash
git add _bibliography/papers.bib
git commit -m "feat: publications bibliography (4 papers)"
```

---

### Task 6: CV（Experience + Honors）

**Files:**
- Modify: `_data/cv.yml`（替换 al-folio 示例）
- Verify: `_pages/cv.md` 使用 `_data/cv.yml`（al-folio 新版默认支持）

**Interfaces:**
- Consumes: 无。
- Produces: `/cv` 页面的 Experience 与 Honors and Awards 段。

- [ ] **Step 1: 写入 `_data/cv.yml`**

```yaml
- title: Experience
  type: time_table
  contents:
    - title: Research Intern
      institution: Xiaomi AI Lab
      year: 2024.05 - Now
    - title: M.S. Student
      institution: Beijing University of Posts and Telecommunications
      year: 2022.09 - Now
    - title: B.S.
      institution: Beijing University of Posts and Telecommunications
      year: 2018.09 - 2022.06

- title: Honors and Awards
  type: time_table
  contents:
    - year: 2024.06
      items:
        - Champion of CVPR 2024 AVA Accessibility Vision and Autonomy Challenge
    - year: 2023.10
      items:
        - The First Prize Scholarship of Beijing University of Posts and Telecommunications
    - year: 2023.06
      items:
        - Second Place of CVPR 2023 AVA Accessibility Vision and Autonomy Challenge
    - year: 2023.05
      items:
        - Honorable Mention Prize of CCF 2023 Mobile Robot Grasping and Navigation Challenge
    - year: 2022.10
      items:
        - The First Prize Scholarship of Beijing University of Posts and Telecommunications
    - year: 2022.06
      items:
        - Outstanding Graduate of Beijing
    - year: 2021.12
      items:
        - Top-5 Solution of 2021 CCF-BDCI Action Recognition Challenge
    - year: 2021.10
      items:
        - National Encouragement Scholarship
        - Merit Student of Beijing University of Posts and Telecommunications
    - year: 2020.10
      items:
        - National Encouragement Scholarship
        - Merit Student of Beijing University of Posts and Telecommunications
```

- [ ] **Step 2: 确认 `_pages/cv.md` 以 data 模式渲染**

```bash
cd /Users/zsj/Documents/work/HomePage
grep -n "cv.yml\|_data/cv\|json" _pages/cv.md || true
```
若 `_pages/cv.md` front matter 指向 json 数据源，改为使用 `site.data.cv`（al-folio 新版默认即读 `_data/cv.yml`；无需改动时跳过并记录）。

- [ ] **Step 3: 校验 YAML**

```bash
cd /Users/zsj/Documents/work/HomePage
python3 - <<'PY'
import yaml
d=yaml.safe_load(open('_data/cv.yml'))
titles=[s['title'] for s in d]
assert 'Experience' in titles and 'Honors and Awards' in titles, titles
exp=[s for s in d if s['title']=='Experience'][0]['contents']
hon=[s for s in d if s['title']=='Honors and Awards'][0]['contents']
print('CV OK: experience', len(exp), 'honors groups', len(hon))
PY
```
Expected: `CV OK: experience 3 honors groups 9`。

- [ ] **Step 4: Commit**

```bash
git add _data/cv.yml _pages/cv.md
git commit -m "feat: cv page with experience and honors"
```

---

### Task 7: 精简导航栏（仅 about / publications / cv）

**Files:**
- Modify: `_pages/*.md`（除 about/publications/cv 外全部 `nav: false`）

**Interfaces:**
- Consumes: Task 1 的 `_pages/`。
- Produces: 顶栏仅 3 个入口。

- [ ] **Step 1: 找出当前有 nav 的页面**

```bash
cd /Users/zsj/Documents/work/HomePage
grep -l "^nav: true" _pages/*.md
```
Expected: 列出 about/publications/cv 以及 projects/teaching/repositories/blog 等。

- [ ] **Step 2: 关闭多余页面的 nav**

对每个**不是** about/publications/cv 的 `_pages/*.md`，把 `nav: true` 改为 `nav: false`：

```bash
cd /Users/zsj/Documents/work/HomePage
for f in _pages/*.md; do
  case "$f" in
    _pages/about.md|_pages/publications.md|_pages/cv.md) ;;
    *) if grep -q "^nav: true" "$f"; then
         sed -i '' 's/^nav: true/nav: false/' "$f"
       fi ;;
  esac
done
grep -l "^nav: true" _pages/*.md
```
Expected: 仅 `_pages/about.md`、`_pages/cv.md`、`_pages/publications.md`（顺序不限）。

- [ ] **Step 3: 关闭 blog nav（若存在）**

```bash
cd /Users/zsj/Documents/work/HomePage
grep -ni "blog" _config.yml | head
```
若 blog 仍出现在导航（由 `_config.yml`/`jekyll-archives` 控制而非 `_pages/blog.md`），在 `_config.yml` 中关闭其显示。记录处理方式。

- [ ] **Step 4: Commit**

```bash
git add _pages _config.yml
git commit -m "feat: trim navbar to about/publications/cv"
```

---

### Task 8: 部署（GitHub Actions + Pages）

**Files:**
- Verify: `.github/workflows/deploy.yml`（al-folio 自带）

**Interfaces:**
- Consumes: 前序全部内容。
- Produces: 线上站点 https://zhshj0110.github.io。

- [ ] **Step 1: 确认 CI workflow 存在并针对 main 触发**

```bash
cd /Users/zsj/Documents/work/HomePage
sed -n '1,40p' .github/workflows/deploy.yml
```
Expected: 看到 `on: push: branches: [main, master]`（或类似）与部署到 `gh-pages` 的步骤。若只写 `master`，改为包含 `main`。

- [ ] **Step 2: 推送分支并开 PR**

```bash
cd /Users/zsj/Documents/work/HomePage
git push -u origin feature/al-folio-migration
```
然后用 `gh pr create` 开 PR（标题 `feat: migrate homepage to al-folio`）。**合并到 main 前需用户确认**（破坏性替换）。

- [ ] **Step 3: 合并到 main 触发构建**

用户确认后合并 PR。CI 自动构建并推送到 `gh-pages`。

```bash
cd /Users/zsj/Documents/work/HomePage
gh run list --limit 3
gh run watch
```
Expected: workflow `success`。若失败，`gh run view --log-failed`，逐项修复（常见：bib 字段、YAML 缩进、缺图）。

- [ ] **Step 4: 用户设置 Pages 源（手动）**

指引用户在 GitHub 仓库 **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `gh-pages` / `(root)`**，保存。

- [ ] **Step 5: 验收**

打开 https://zhshj0110.github.io，核对成功标准：
1. al-folio 外观正常。
2. About 显示 Shaojie Zhang、头像、简介、社交、最新 News。
3. `/publications` 显示 4 篇论文（含链接）。
4. `/cv` 显示 Experience + Honors。
5. 导航仅 about/publications/cv。

---

## Self-Review

**Spec coverage:**
- 内容映射（spec §3）→ Task 3(about) / 4(news) / 5(pubs) / 6(cv) ✅
- 头像迁移 → Task 1 Step 4 ✅
- 社交链接 → Task 2 ✅
- 导航 about/publications/cv（spec §4）→ Task 7 ✅
- 覆盖式引入 + 删旧文件（spec §5）→ Task 1 ✅
- `url`/`baseurl` 用户主站（spec §5）→ Task 2 ✅
- "Liu Jinfu" 修正（spec §3）→ Task 3 Step 1/2 ✅
- CI 部署 + Pages 源（spec §6）→ Task 8 ✅
- 推送前 YAML/bib 校验（spec §6）→ 每个任务的校验 Step ✅
- 破坏性替换在分支进行（spec §7）→ Global Constraints + Task 8 需用户确认合并 ✅

**Placeholder scan:** 无 TBD/TODO；每个内容步骤含完整文件内容与校验命令。Task 6 Step 2 / Task 7 Step 3 为条件性检查，附具体判定命令。

**Type/字段一致性:** `_data/cv.yml` 段标题（Experience / Honors and Awards）与校验断言一致；bib 条目数 4 与断言一致；about 的 `news`/`selected_papers` 开关与 Task 4/5 依赖一致。
