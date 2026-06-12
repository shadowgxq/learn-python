import { request } from '../../shared/api';
import type { Task, TaskCreate, TaskUpdate } from './tasks.types';

export const tasksApi = {
  list() {
    return request<Task[]>({ url: '/v1/tasks' });
  },

  create(data: TaskCreate) {
    return request<Task>({ url: '/v1/tasks', method: 'POST', data });
  },

  update(id: number, data: TaskUpdate) {
    return request<Task>({ url: `/v1/tasks/${id}`, method: 'PATCH', data });
  },

  delete(id: number) {
    return request<{ success: boolean }>({ url: `/v1/tasks/${id}`, method: 'DELETE' });
  },
};
