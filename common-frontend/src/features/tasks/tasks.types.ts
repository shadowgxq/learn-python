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
