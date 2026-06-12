# Manager Status

`manager/plan.yaml` 是 Manager 的唯一事实源。本文件只展示当前执行进度，便于用户直接判断当前批次和 OpenSpec 生命周期走到哪一步。

## 未规划 Manager 批次

当前模板未保留具体业务批次。迁入使用方项目后，应以 `manager/plan.yaml` 的 `current` 字段为准更新本文件。

| 项目       | 当前值                                               |
| ---------- | ---------------------------------------------------- |
| 当前 batch | `null`                                               |
| 当前 wave  | `null`                                               |
| 下一步     | 从 PRD 或需求文档生成 `manager/plan.yaml` 后再运行。 |
| 最近更新   | `YYYY-MM-DD`                                         |

## 待执行批次

当前无待执行 batch。`manager/plan.yaml` 中未保留活动 batch，等待下一轮规划。
