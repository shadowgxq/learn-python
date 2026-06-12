# AGENTS.md

本文件是前端项目 agent 协作入口规则。

## Communication

- 默认使用中文沟通和解释。
- 技术术语、命令、路径、文件名、环境变量、配置键、错误信息、日志和 URL 保持原文。

## Working Principles

- 优先理解用户目标、当前上下文、交互路径和数据流；不清楚时先查现有实现和文档。
- 如果仍有影响结果的歧义，先提出简短问题；影响较小时可以自主判断，并在交付时说明。
- 改动遵循最小范围原则，只处理当前任务直接相关的内容，不顺手重构、格式化或抽象无关代码。

## Documentation

- 文档目录职责、归档规则和流转说明统一参考 `docs/README.md`。
- 进入具体规范前，先通过 `docs/README.md` 判断文档位置；只按需读取和当前任务相关的细则。
- 在首次编辑文件前完成必要规范读取；如果任务范围扩大，再补读新增范围对应规范。
- 涉及前端实现时，至少读取 `docs/frontend/standards/frontend-development.md`按照规范实现。


## Frontend Implementation

- 新增需求、新增页面或扩展既有功能时，按实际涉及范围读取 `docs/frontend/README.md` 分流到 `architecture/`、`standards/`、`components/` 或 `guides/` 后执行。
- 涉及 UI、组件、表单、列表、详情、交互状态或组件拆分时，追加读取 `docs/frontend/components/components.md`、`docs/frontend/components/component-splitting.md` 和 `docs/frontend/standards/file-organization.md`。
- 新增页面时，route page entry 只承担路由参数、页面级 composition、状态归属和数据流编排；独立 UI 区块按 `docs/frontend/` 规范下沉为命名组件。
- 实现前先确认 entry、state ownership、data flow、interaction flow 和 stable UI boundaries，再决定组件拆分、目录放置和需要补读的规范。

## Constraints

- 开发阶段只做最小必要检查，不主动执行 `dev server`、`build`、`deploy`、`publish` 等高副作用命令。
- 未经用户明确要求，不执行 `git add`、`git commit`、`git push`。
- 不修改、回滚、覆盖或提交与当前任务无关的文件，尤其是 dirty worktree 中已有用户改动。

## Delivery

- 交付时说明本次修改范围，以及已执行或未执行的验证。
- 如果验证因缺少依赖、脚本或用户授权无法执行，必须明确说明。
