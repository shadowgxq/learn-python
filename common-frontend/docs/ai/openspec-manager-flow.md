# OpenSpec Manager Workflow

目标：用最少状态完成“需求 -> OpenSpec -> 批次 -> 用户确认 -> subagent 执行 -> 回写”。

## 唯一状态源

`manager/plan.yaml`

状态写入、执行编排和验证证据统一落在 `manager/plan.yaml`。

## 入口路由

根 `AGENTS.md` 只负责判断是否进入 Manager 流程。进入后按本文档和对应 skill 执行：

- 从 PRD 或需求文档生成计划时，使用 `$manager-plan-from-doc`。
- 执行当前批次时，使用 `$manager-execute-current-batch`；执行前必须展示 batch、wave、behavior、OpenSpec 范围并等待用户确认。
- 清理已完成 Manager 条目时，使用 `$manager-archive-completed`；Manager archive 和 OpenSpec archive 是两类不同归档。
- 需要连续推进时，优先使用 Goal 循环调用 `$manager-execute-current-batch`；需要外部非交互 shell runner 时再使用 `scripts/ralph/ralph.sh`。

## 进程可视化

面向用户展示当前进度时，使用 `current.title` 作为标题：

```md
## <current.title>
```

`current.next` 解释下一步动作，`current.batch` 和 `current.wave` 定位 skill 继续执行的位置。OpenSpec 的真实状态维护在 `openspec[].phase` 和 `openspec[].state`，避免在 `current` 中重复状态。

## Phase 与 State

`phase` 回答：现在处在 OpenSpec 生命周期哪一步？

| phase     | 含义                          |
| --------- | ----------------------------- |
| `change`  | 创建或维护 OpenSpec artifacts |
| `apply`   | 执行 OpenSpec tasks           |
| `archive` | 等待用户确认并归档            |
| `done`    | 生命周期结束                  |

`state` 回答：这一步当前能不能执行、执行到哪了？

| state         | 含义                                    |
| ------------- | --------------------------------------- |
| `planned`     | 已规划，但当前 phase 还没有准备好执行   |
| `ready`       | 当前 phase 前置条件满足，等待确认或调度 |
| `in-progress` | 当前 phase 正在执行                     |
| `blocked`     | 当前 phase 被阻塞                       |
| `cancelled`   | 明确取消，不再继续推进                  |

## 流程

1. 需求拆分后写入 `manager/plan.yaml.requirements`。
2. Manager 把需求拆成 `openspec` 条目；每个条目维护 `phase`、`state`、artifact 入口和依赖。
3. Manager 规划 `batches`；batch 只维护执行编排：
   - `behavior: change` 表示创建/完善 OpenSpec。
   - `behavior: apply` 表示执行 OpenSpec tasks。
   - `behavior: archive` 表示自动化执行结束，等待用户明确归档确认。
   - `waves` 表示 batch 内的执行分组，按列表顺序执行。
   - 每个 wave 通过 `openspec` 引用 change id。
   - 每个 wave 的 `parallel` 只影响该 wave 内的 OpenSpec。
4. Skill 从当前 batch/wave 引用的 OpenSpec 中读取当前行为对应的执行入口：
   - `change` 读取 `artifacts`，执行入口固定为 `opsx:ff`，依赖 `openspec-ff-change`。
   - `apply` 读取 `tasks`，执行入口固定为 `opsx:apply`，依赖 `openspec-apply-change`。
   - `archive` 读取 `path`，只能由用户明确确认后执行。
   - 同时读取依赖，并结合项目默认规则推导验证命令后展示执行计划。
5. 用户确认后才派发 subagent。
6. subagent 返回后，skill 验收、验证并回写 `manager/plan.yaml`。

## Goal 使用方案

Goal 是默认推荐的 Manager/OpenSpec 连续推进方式。用户可以创建一个持续目标，让 Agent 每轮执行当前可执行的 `$manager-execute-current-batch`，执行后重新读取 `manager/plan.yaml` 并继续下一轮。

推荐目标描述：

```text
循环执行当前项目的 `$manager-execute-current-batch`。

每轮按该 skill 从 `manager/plan.yaml` 执行当前可执行的 Manager batch/wave；执行完后重新读取 `manager/plan.yaml` 并继续下一轮。

当该 skill 要求用户确认执行 preview 时，视为我已确认，直接继续，不要再询问我。

持续执行直到 `manager/plan.yaml` 中没有可继续自动执行的 Manager 工作；如果只剩需要显式确认的 archive，则停止并汇报当前 plan 状态。
```

Goal 循环规则：

- 每轮仍由 `$manager-execute-current-batch` 解析 batch、wave、behavior、OpenSpec 范围、执行入口、依赖、并行和验证；不要在 Goal 提示中重写这些规则。
- preview 确认可由 Goal 预授权，但仅适用于非 `archive` 工作；OpenSpec archive 和 Manager archive 仍必须等待用户明确确认。
- 每轮结束后必须重新读取 `manager/plan.yaml`，以当前状态决定是否继续、停止或汇报阻塞。
- 不自动执行 `git add`、`git commit`、`git push`、deploy、publish 或 OpenSpec archive。

## Ralph 使用方案

`scripts/ralph/ralph.sh` 是外部非交互 shell runner，适合需要 CLI 循环、超时控制或 transcript 落盘的场景。常规连续推进优先使用 Goal。

推荐单轮执行：

```bash
bash scripts/ralph/ralph.sh codex 1
```

需要外部循环时显式指定迭代次数：

```bash
bash scripts/ralph/ralph.sh codex <iterations>
```

Ralph 约束：

- Ralph 只是循环 wrapper，每轮仍必须通过 `$manager-execute-current-batch` 推进一个非 `archive` wave。
- agent 非 0 退出、超时或用户中断时，停止后续 iteration，不回滚 workspace、OpenSpec artifacts 或 `manager/plan.yaml`。
- 运行状态和 transcript 写入 `scripts/ralph/logs/`；失败、中断或达到 `max-iterations` 时保留故障现场。
- 继续执行时以 `manager/plan.yaml` 和当前文件系统为准；无法安全判断现场时标记 `blocked` 并等待人工处理。

## 执行入口与 Skill 依赖

| behavior  | 执行入口     | 强制 skill              | 说明                                               |
| --------- | ------------ | ----------------------- | -------------------------------------------------- |
| `change`  | `opsx:ff`    | `openspec-ff-change`    | 生成进入实现前所需的 OpenSpec artifacts。          |
| `apply`   | `opsx:apply` | `openspec-apply-change` | 按 OpenSpec apply instructions 和 tasks 执行实现。 |
| `archive` | 手动确认     | 无                      | 只在用户明确同意 archive 后执行。                  |

Skill 派发 handoff 时必须写明执行入口和对应 skill。

## Subagent Handoff

Skill 派发 subagent 时，从当前 wave 引用的 OpenSpec 条目解析当前行为的执行入口，并结合项目默认规则生成 handoff：

```yaml
batch: <batch-id>
wave: <wave-id>
behavior: <change|apply|archive>
entrypoint: <opsx:ff|opsx:apply|manual>
required_skills:
  - <openspec-ff-change|openspec-apply-change>
openspec:
  - <change-id>
inputs:
  - <allowed-path>
checks:
  - <inferred-command>
parallel: <true|false>
archive_allowed: false
manager_file: manager/plan.yaml
```

Handoff 规则：

- subagent 只处理 handoff 指定的 `openspec`、`wave` 和 `behavior`；同一 batch 内其它 wave 由 skill 继续派发。
- `change` 只处理 `artifacts`，`apply` 只从 `tasks` 读取任务并按 tasks 限定实际改动范围。
- handoff 必须声明 `required_skills`、执行入口、允许输入和推导出的验证命令。
- subagent 不修改 `manager/plan.yaml`，不执行 OpenSpec archive；状态回写和 archive 由 skill 在用户明确确认后处理。
- subagent 返回改动文件、完成项、验证结果和风险。

## 并行判断

batch 内的 `waves` 按顺序执行。只有同时满足以下条件，同一个 wave 内的 OpenSpec 才并行：

- wave 的 `parallel: true`。
- OpenSpec 的 `depends_on` 不互相阻塞。
- 对应 behavior 的执行入口不重叠。
- 不对同一个 change 目录重复执行同一个 `opsx` 入口。
- 不修改共享配置、共享类型或同一文件。

否则串行执行。

## 回写内容

`manager/plan.yaml` 回写：

- 当前 batch/status。
- 当前 wave。
- OpenSpec `phase/state`。
- 验证结果证据。
- blocker 或 next。

## 推荐字段边界

- `requirements`: 写需求来源、优先级和验收点。
- `openspec`: 写 `phase`、`state`、`path`、`artifacts`、`tasks` 和依赖；`reason` 或 `conflicts_with` 按执行决策需要补充。
- `batches`: 写执行编排；batch 表达一次用户确认的执行目标，waves 表达内部顺序和局部并行。
- `checks`: 由 skill 从项目脚本和行为类型推导；特殊验证写入 batch evidence 或执行备注。
