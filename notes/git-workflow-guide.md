# Git 工作流完整指南

> 从写代码到提交远程仓库的所有常用场景及命令

---

## 目录

- [场景 0：初始化（克隆项目）](#场景-0初始化克隆项目)
- [场景 1：开始开发新需求](#场景-1开始开发新需求)
- [场景 2：写代码过程中的常见操作](#场景-2写代码过程中的常见操作)
- [场景 3：提交代码](#场景-3提交代码)
- [场景 4：撤销修改（核心重点）](#场景-4撤销修改核心重点)
- [场景 5：推送到远程仓库](#场景-5推送到远程仓库)
- [场景 6：多人协作（拉取别人的代码）](#场景-6多人协作拉取别人的代码)
- [场景 7：提交 PR 前的准备](#场景-7提交-pr-前的准备)
- [场景 8：解决冲突](#场景-8解决冲突)
- [场景 9：查看提交历史](#场景-9查看提交历史)
- [完整 Demo 示例](#完整-demo-示例)
- [常用命令速查表](#常用命令速查表)

---

## 场景 0：初始化（克隆项目）

```bash
# 从远程仓库克隆项目
git clone https://github.com/your-team/project.git
cd project

# 查看当前分支和状态
git branch              # 查看本地分支
git status              # 查看工作区状态
```

---

## 场景 1：开始开发新需求

```bash
# 1. 确保 master 是最新的
git checkout master
git pull origin master

# 2. 从 master 创建新分支（命名规范：feature/xxx 或 fix/xxx）
git checkout -b feature/user-login

# 等价于两条命令：
# git branch feature/user-login     # 创建分支
# git checkout feature/user-login   # 切换到分支
```

---

## 场景 2：写代码过程中的常见操作

### 2.1 查看修改了哪些文件

```bash
git status

# 输出示例：
# On branch feature/user-login
# Changes not staged for commit:
#   modified:   src/login.js
#   modified:   src/utils.js
# Untracked files:
#   src/auth.js
```

### 2.2 查看具体修改了什么内容

```bash
# 查看工作区的修改（未 add）
git diff

# 查看某个文件的修改
git diff src/login.js

# 查看已经 add 到暂存区的修改
git diff --staged
```

### 2.3 写到一半想暂存现场（切到别的分支改 bug）

```bash
# 保存当前工作区和暂存区的修改
git stash

# 或者加上描述
git stash save "临时保存登录功能的修改"

# 切到其他分支改 bug
git checkout hotfix/urgent-bug
# ... 修改并提交 ...

# 回来继续开发
git checkout feature/user-login
git stash pop              # 恢复最近一次 stash 并删除
# 或
git stash list             # 查看所有 stash
git stash apply stash@{0}  # 恢复指定 stash 但不删除
git stash drop stash@{0}   # 删除指定 stash
```

---

## 场景 3：提交代码

### 3.1 正常提交流程

```bash
# 1. 查看修改了哪些文件
git status

# 2. 添加文件到暂存区（推荐指定文件，避免误提交）
git add src/login.js src/auth.js

# 如果确认所有修改都要提交，可以用：
git add .

# 3. 查看暂存区的文件
git status

# 4. 提交到本地仓库
git commit -m "feat: 实现用户登录功能"

# commit message 规范（约定式提交）：
# feat: 新功能
# fix: 修复 bug
# docs: 文档修改
# style: 代码格式修改（不影响功能）
# refactor: 重构
# test: 测试相关
# chore: 构建工具或辅助工具的变动
```

### 3.2 提交后发现 commit message 写错了

```bash
# 修改最近一次 commit 的 message（未 push）
git commit --amend -m "feat: 实现用户登录和注册功能"
```

### 3.3 提交后发现漏了一个文件

```bash
# 补充文件并合并到上一次 commit（未 push）
git add src/forgot-password.js
git commit --amend --no-edit    # --no-edit 表示不修改 commit message
```

---

## 场景 4：撤销修改（核心重点）

### 4.1 撤销工作区的修改（未 add）

```bash
# 场景：改了 login.js，但不想要这次修改了，想恢复到上次 commit 的状态

# 方式1：推荐（新命令）
git restore src/login.js

# 方式2：老命令（不推荐，但面试常考）
git checkout -- src/login.js

# 撤销所有工作区修改
git restore .
```

### 4.2 取消暂存（已 add，想撤回到工作区）

```bash
# 场景：执行了 git add src/login.js，但不想 add 了，想撤回到工作区

# 方式1：推荐（新命令）
git restore --staged src/login.js

# 方式2：老命令
git reset HEAD src/login.js

# 取消所有暂存
git restore --staged .
```

### 4.3 撤销 commit（已 commit，未 push）

```bash
# 场景：commit 提交错了，想撤销

# 方式1：回退到上一次 commit，保留工作区修改（最常用）
git reset --mixed HEAD~1
# 或
git reset HEAD~1          # 默认就是 --mixed

# 方式2：回退到上一次 commit，修改保留在暂存区
git reset --soft HEAD~1

# 方式3：回退到上一次 commit，丢弃所有修改（危险操作）
git reset --hard HEAD~1

# HEAD~1 表示回退 1 个 commit
# HEAD~2 表示回退 2 个 commit
# 也可以指定 commit id：git reset --mixed abc123
```

### 4.4 git reset 三种模式的区别（面试必考）

假设当前状态：
- 工作区：修改了 A.js
- 暂存区：add 了 B.js
- 本地仓库：commit 了 C.js

**git reset --soft HEAD~1**
- 结果：只回退本地仓库（C.js 回退），暂存区和工作区不变
- 工作区：A.js 修改保留
- 暂存区：B.js + C.js（C.js 回退到暂存区）
- 本地仓库：回退到上一次 commit

**git reset --mixed HEAD~1（默认）**
- 结果：回退本地仓库和暂存区，工作区不变
- 工作区：A.js + B.js + C.js 修改都保留
- 暂存区：空
- 本地仓库：回退到上一次 commit

**git reset --hard HEAD~1**
- 结果：三个区域全部回退，所有修改丢失
- 工作区：空
- 暂存区：空
- 本地仓库：回退到上一次 commit

### 4.5 四个工作区域流转图

```
工作区 (Working Directory)
    ↓ git add
暂存区 (Staging Area / Index)
    ↓ git commit
本地仓库 (Local Repository)
    ↓ git push
远程仓库 (Remote Repository)
```

**撤销操作对应的区域**：
- `git restore <file>`：丢弃工作区修改
- `git restore --staged <file>`：取消暂存（暂存区 → 工作区）
- `git reset HEAD~1`：回退本地仓库
- `git push`：推送到远程仓库

---

## 场景 5：推送到远程仓库

### 5.1 第一次推送（新分支）

```bash
# 推送到远程并设置跟踪关系
git push -u origin feature/user-login

# -u 是 --set-upstream 的简写，作用：
# 1. 把本地分支推送到远程
# 2. 建立本地分支和远程分支的跟踪关系
# 3. 以后直接 git push 就行，不用每次都写 origin feature/user-login
```

### 5.2 后续推送（已建立跟踪关系）

```bash
# 简单推送
git push

# 等价于
git push origin feature/user-login
```

### 5.3 推送前发现远程分支有更新

```bash
# 场景：你本地 commit 了，准备 push，但提示远程分支有更新

# 方式1：先 pull 再 push（会产生一个 merge commit）
git pull origin feature/user-login
# 如果有冲突，解决冲突后：
git add .
git commit -m "merge: 合并远程更新"
git push

# 方式2：rebase（推荐，保持 commit 历史线性）
git pull --rebase origin feature/user-login
# 如果有冲突，解决冲突后：
git add .
git rebase --continue
git push
```

### 5.4 强制推送（慎用）

```bash
# 场景：本地 reset 回退了，但远程分支还有那个 commit，需要强制覆盖

# 方式1：强制推送（危险，会覆盖远程分支）
git push --force origin feature/user-login

# 方式2：更安全的强制推送（如果远程分支被别人更新了，会拒绝推送）
git push --force-with-lease origin feature/user-login
```

**⚠️ 重要：永远不要对 master/main 分支执行 force push！**

---

## 场景 6：多人协作（拉取别人的代码）

### 6.1 拉取远程最新代码

```bash
# 拉取远程分支并合并到本地
git pull origin master

# 等价于两条命令：
git fetch origin master    # 拉取远程代码到本地仓库
git merge origin/master    # 合并到当前分支

# 推荐：用 rebase 而不是 merge（保持线性历史）
git pull --rebase origin master
```

### 6.2 切换到别人的分支

```bash
# 查看所有远程分支
git branch -r

# 切换到别人的远程分支
git checkout -b feature/payment origin/feature/payment

# 或者（新命令）
git switch -c feature/payment origin/feature/payment
```

---

## 场景 7：提交 PR 前的准备

```bash
# 1. 确保 master 是最新的
git checkout master
git pull origin master

# 2. 把 master 的最新代码合并到你的分支
git checkout feature/user-login
git rebase master
# 或
git merge master

# 如果有冲突，解决冲突后：
git add .
git rebase --continue   # 如果用的是 rebase
# 或
git commit              # 如果用的是 merge

# 3. 推送到远程
git push origin feature/user-login
# 如果之前用了 rebase，需要强制推送
git push --force-with-lease origin feature/user-login

# 4. 在 GitHub/GitLab 上创建 Pull Request
```

---

## 场景 8：解决冲突

```bash
# 场景：pull 或 merge 时提示冲突

# 1. 查看哪些文件有冲突
git status

# 2. 打开冲突文件，手动解决冲突
# 冲突标记：
# <<<<<<< HEAD
# 你的修改
# =======
# 别人的修改
# >>>>>>> branch-name

# 3. 删除冲突标记，保留正确的代码

# 4. 标记冲突已解决
git add src/login.js

# 5. 继续操作
git rebase --continue   # 如果是 rebase 产生的冲突
# 或
git commit              # 如果是 merge 产生的冲突

# 如果解决不了，放弃本次操作：
git rebase --abort      # 如果是 rebase
git merge --abort       # 如果是 merge
```

---

## 场景 9：查看提交历史

```bash
# 查看 commit 历史
git log

# 单行显示（推荐）
git log --oneline

# 查看最近 5 条
git log -5

# 查看某个文件的修改历史
git log src/login.js

# 查看某次 commit 的详细修改
git show abc123

# 图形化显示分支历史
git log --oneline --graph --all
```

---

## 完整 Demo 示例

### 第1天：开始开发新功能

```bash
# 1. 克隆项目
git clone https://github.com/your-team/project.git
cd project

# 2. 从 master 创建新分支
git checkout master
git pull origin master
git checkout -b feature/user-login

# 3. 写代码...
# 修改了 src/login.js、src/auth.js

# 4. 查看修改
git status
git diff

# 5. 提交代码
git add src/login.js src/auth.js
git commit -m "feat: 实现用户登录功能"

# 6. 推送到远程
git push -u origin feature/user-login
```

### 第2天：继续开发，但中途要改 bug

```bash
# 1. 继续写代码...
# 修改了 src/login.js

# 2. 突然要改紧急 bug，暂存当前工作
git stash save "登录功能开发中"

# 3. 切到 master 创建 hotfix 分支
git checkout master
git pull origin master
git checkout -b hotfix/urgent-bug

# 4. 修复 bug
# 修改了 src/utils.js
git add src/utils.js
git commit -m "fix: 修复xxx紧急bug"
git push -u origin hotfix/urgent-bug

# 5. 回到开发分支，恢复工作
git checkout feature/user-login
git stash pop

# 6. 继续开发并提交
git add src/login.js
git commit -m "feat: 完善登录功能"
git push
```

### 第3天：准备提交 PR

```bash
# 1. 同步 master 最新代码
git checkout master
git pull origin master

# 2. 把 master 合并到你的分支
git checkout feature/user-login
git rebase master

# 3. 如果有冲突，解决冲突
# 打开冲突文件，手动解决
git add .
git rebase --continue

# 4. 推送到远程（因为用了 rebase，需要强制推送）
git push --force-with-lease origin feature/user-login

# 5. 在 GitHub 上创建 Pull Request
```

### 第4天：PR 被 review，需要修改

```bash
# 1. 修改代码
# 修改了 src/login.js

# 2. 提交修改
git add src/login.js
git commit -m "fix: 根据 review 意见修改登录逻辑"
git push

# 3. PR 通过，合并到 master
```

### 常见错误场景

```bash
# 错误1：提交后发现 commit message 写错了
git commit --amend -m "正确的 commit message"

# 错误2：add 错文件了，想取消暂存
git restore --staged src/wrong-file.js

# 错误3：改错代码了，想撤销工作区修改
git restore src/login.js

# 错误4：commit 提交错了，想撤销
git reset HEAD~1              # 撤销 commit，修改保留在工作区
git reset --soft HEAD~1       # 撤销 commit，修改保留在暂存区
git reset --hard HEAD~1       # 撤销 commit，丢弃所有修改（危险）

# 错误5：已经 push 了，但想撤销
# 方式1：revert（推荐，生成一个新 commit 撤销之前的修改）
git revert abc123
git push

# 方式2：reset + force push（危险，会改写历史）
git reset --hard HEAD~1
git push --force-with-lease
```

---

## 常用命令速查表

| 场景 | 命令 |
|------|------|
| 克隆项目 | `git clone <url>` |
| 创建并切换分支 | `git checkout -b <branch>` |
| 切换分支 | `git checkout <branch>` |
| 查看状态 | `git status` |
| 查看修改 | `git diff` |
| 查看暂存区修改 | `git diff --staged` |
| 添加到暂存区 | `git add <file>` 或 `git add .` |
| 提交 | `git commit -m "message"` |
| 修改最近一次 commit | `git commit --amend` |
| 推送（第一次） | `git push -u origin <branch>` |
| 推送（后续） | `git push` |
| 强制推送（安全） | `git push --force-with-lease` |
| 拉取 | `git pull origin <branch>` |
| 拉取（rebase） | `git pull --rebase origin <branch>` |
| 暂存当前工作 | `git stash` 或 `git stash save "描述"` |
| 恢复暂存 | `git stash pop` |
| 查看所有 stash | `git stash list` |
| 撤销工作区修改 | `git restore <file>` |
| 取消暂存 | `git restore --staged <file>` |
| 撤销 commit（保留修改在工作区） | `git reset HEAD~1` |
| 撤销 commit（保留修改在暂存区） | `git reset --soft HEAD~1` |
| 撤销 commit（丢弃所有修改） | `git reset --hard HEAD~1` |
| 查看历史 | `git log --oneline` |
| 查看图形化历史 | `git log --oneline --graph --all` |
| 查看某次 commit 详情 | `git show <commitId>` |
| 查看所有分支 | `git branch -a` |
| 查看远程分支 | `git branch -r` |
| 删除本地分支 | `git branch -d <branch>` |
| 强制删除本地分支 | `git branch -D <branch>` |

---

## git checkout 的多种用法

```bash
# 1. 切换分支
git checkout master

# 2. 创建并切换分支
git checkout -b feature/new-feature

# 3. 切换到某个 commit（分离头指针状态）
git checkout abc123

# 4. 撤销工作区修改（老命令，不推荐）
git checkout -- src/login.js

# 5. 从远程分支创建本地分支
git checkout -b feature/payment origin/feature/payment
```

---

## git restore vs git reset vs git checkout

### git restore（新命令，推荐）

```bash
# 撤销工作区修改
git restore <file>

# 取消暂存
git restore --staged <file>
```

### git reset（回退 commit）

```bash
# 回退 commit，修改保留在工作区
git reset HEAD~1

# 回退 commit，修改保留在暂存区
git reset --soft HEAD~1

# 回退 commit，丢弃所有修改
git reset --hard HEAD~1
```

### git checkout（老命令，功能太多）

```bash
# 切换分支
git checkout <branch>

# 撤销工作区修改（不推荐，用 git restore 代替）
git checkout -- <file>
```

---

## 最佳实践建议

1. **提交前必做三件事**：
   - `git status` 确认修改了哪些文件
   - `git diff` 确认修改了什么内容
   - 指定文件 add，避免 `git add .` 误提交

2. **commit message 规范**：
   - 用约定式提交（feat/fix/docs/style/refactor/test/chore）
   - 一行说清楚改了什么，不要写"修改"、"更新"这种无意义的词

3. **分支命名规范**：
   - 功能分支：`feature/功能名`
   - 修复分支：`fix/bug名` 或 `hotfix/紧急bug名`
   - 不要用 `test`、`dev`、`tmp` 这种无意义的名字

4. **推送前必做**：
   - `git pull --rebase origin master` 同步 master 最新代码
   - 解决冲突后再 push

5. **永远不要**：
   - 对 master/main 分支执行 `git push --force`
   - 用 `git reset --hard` 回退已经 push 的 commit（用 `git revert` 代替）
   - 在工作区有未提交修改时执行 `git checkout` 切换分支（先 stash 或 commit）

6. **遇到问题先**：
   - `git status` 看当前状态
   - `git log --oneline` 看提交历史
   - Google 搜索错误信息

---

## 扩展阅读

- [Git 官方文档](https://git-scm.com/doc)
- [约定式提交规范](https://www.conventionalcommits.org/zh-hans/)
- [Git 分支管理最佳实践](https://nvie.com/posts/a-successful-git-branching-model/)
