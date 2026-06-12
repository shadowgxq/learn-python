# Frontend Agent Template

这是一个面向 AI Agent 协作的前端模板项目，用于快速建立可迁移、可执行、可维护的前端工程基线。

模板默认提供 `Vite + React + TypeScript + pnpm` 的最小可运行工程，并预装公司默认场景的基础前端依赖，同时保留 Agent 协作规则、文档结构、Manager/OpenSpec 工作流入口和源码目录骨架。

## 适用场景

- 新建一个 AI Agent 友好的前端项目。
- 将统一的协作规则、工程规范和文档结构迁入已有前端项目。
- 让 Agent 能通过稳定的入口文档、计划状态和规格流程推进需求。

## 项目内容

| 路径                                          | 作用                                                        |
| --------------------------------------------- | ----------------------------------------------------------- |
| `AGENTS.md`                                   | Agent 协作入口规则。                                        |
| `docs/`                                       | 长期文档入口，包含 AI 协作、前端规范、API 和 PRD 目录说明。 |
| `manager/`                                    | Manager 计划、执行状态、archive 和 bug cleanup 队列。       |
| `openspec/`                                   | OpenSpec 规格驱动工作流骨架。                               |
| `.agents/skills/`                             | 项目级 Agent skills。                                       |
| `scripts/`                                    | Manager 校验和 Ralph shell runner。                         |
| `src/`                                        | 模板自身的最小可运行源码。                                  |
| `templates/src/`                              | 迁入目标项目时可复用的源码骨架。                            |
| `package.json`、`vite.config.ts`、`tsconfig*` | 默认前端工程配置。                                          |

## 快速开始

```bash
pnpm install
pnpm dev
```

常用验证命令：

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

## 文档入口

- `docs/README.md`：文档目录职责、读取顺序和维护规则。
- `docs/ai/agent-guide.md`：Agent 执行补充、上下文收集、验证交付和模板成熟度自检。
- `docs/ai/openspec-manager-flow.md`：Manager/OpenSpec 生命周期和批次推进规则。
- `docs/frontend/standards/frontend-development.md`：前端日常开发规范。
- `docs/frontend/guides/project-bootstrap.md`：基于模板创建新项目和已有项目迁入清单。

## 工作流入口

Manager 用于把需求拆成可执行批次，并通过 OpenSpec 管理规格变更：

- 计划状态保存在 `manager/plan.yaml`。
- 执行规则参考 `docs/ai/openspec-manager-flow.md`。
- 连续推进优先使用 Goal 循环调用 `$manager-execute-current-batch`。
- 需要外部非交互 shell runner 时，使用 `scripts/ralph/ralph.sh`。
- bug cleanup 队列位于 `manager/bugs/`。

## 业务边界

本仓库只保存通用前端工程模板，不保存具体业务域规则、业务实体、接口契约、页面需求或验收标准。

迁入具体项目后，业务内容应放入使用方项目自己的 `docs/prd/`、`docs/api/`、`openspec/specs/` 或对应业务文档目录。

## 默认技术基线

- `Node >=18`
- `pnpm`
- `React 18`
- `Vite 6`
- `TypeScript 5`

## 默认工程选型

以下依赖会随模板预装并提供最小入口，但不强制业务项目使用：

- Routing：`react-router-dom`
- HTTP request：`axios`
- Server state：`@tanstack/react-query`
- Client UI state：`zustand`
- UI primitive：少量 Radix UI 基础包
- Icons：`lucide-react`，并在 `shared/icons` 预留业务自定义图标出口
- className：`clsx`
- Testing：`vitest`、React Testing Library、`jsdom`

表单、表格、schema validation、日期工具和图表库不默认预装，使用方项目按业务复杂度和团队约定补充。
