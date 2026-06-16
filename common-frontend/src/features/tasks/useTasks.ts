import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { tasksApi } from './tasks.api';
import type { TaskCreate, TaskListParams, TaskUpdate } from './tasks.types';

const TASKS_KEY = ['tasks'];

export function useTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: [...TASKS_KEY, params],
    queryFn: () => tasksApi.list(params),
    // 翻页/筛选时保留上一页数据，避免列表闪烁为空。
    placeholderData: keepPreviousData,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) => tasksApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}
