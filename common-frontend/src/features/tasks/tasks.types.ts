export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface TaskCreate {
  title: string;
}

export interface TaskUpdate {
  title?: string;
  completed?: boolean;
}

export type TaskSortBy = 'id' | 'title' | 'completed';
export type SortOrder = 'asc' | 'desc';

/** 任务列表查询参数，与后端 TaskListParams 对应，全部可选并由后端兜底默认值。 */
export interface TaskListParams {
  completed?: boolean;
  keyword?: string;
  page?: number;
  page_size?: number;
  sort_by?: TaskSortBy;
  sort_order?: SortOrder;
}

/** 分页列表响应，与后端 TaskListResponse 对应。 */
export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
