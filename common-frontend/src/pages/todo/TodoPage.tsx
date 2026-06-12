import { useState, type FormEvent } from 'react';
import { useAuthStore } from '../../features/auth/auth.store';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../features/tasks/useTasks';
import styles from './TodoPage.module.css';

export default function TodoPage() {
  const { user, token, login, register, logout } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isLoggedIn = !!token && !!user;

  async function handleAuth(type: 'login' | 'register') {
    setAuthError('');
    try {
      if (type === 'login') {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '操作失败';
      setAuthError(msg);
    }
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    createTask.mutate({ title }, { onSuccess: () => setNewTitle('') });
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.authCard}>
          <h1 className={styles.title}>Todo App</h1>
          <p className={styles.subtitle}>请登录或注册</p>
          {authError && <p className={styles.error}>{authError}</p>}
          <form
            className={styles.authForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleAuth('login');
            }}
          >
            <input
              className={styles.input}
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className={styles.authActions}>
              <button className={styles.btnPrimary} type="submit">
                登录
              </button>
              <button className={styles.btnSecondary} type="button" onClick={() => handleAuth('register')}>
                注册
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Todo App</h1>
        <div className={styles.userBar}>
          <span>{user.username}</span>
          <button className={styles.btnText} onClick={logout}>
            退出
          </button>
        </div>
      </header>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <input
          className={styles.input}
          placeholder="添加新任务..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button className={styles.btnPrimary} type="submit" disabled={createTask.isPending}>
          添加
        </button>
      </form>

      {isLoading ? (
        <p className={styles.empty}>加载中...</p>
      ) : tasks && tasks.length > 0 ? (
        <ul className={styles.list}>
          {tasks.map((task) => (
            <li key={task.id} className={styles.item}>
              <label className={styles.itemLabel}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => updateTask.mutate({ id: task.id, data: { completed: !task.completed } })}
                />
                <span className={task.completed ? styles.done : undefined}>{task.title}</span>
              </label>
              <button
                className={styles.btnDelete}
                onClick={() => deleteTask.mutate(task.id)}
                aria-label="删除"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>暂无任务，添加一个吧</p>
      )}
    </div>
  );
}
