import { useEffect, useState, type FormEvent } from 'react';
import { useAuthStore } from '../../features/auth/auth.store';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../features/tasks/useTasks';
import styles from './TodoPage.module.css';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'completed';

export default function TodoPage() {
  const { user, token, login, register, logout } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');

  // 搜索输入做 300ms 防抖，避免每次按键都请求；关键词变化时回到第一页。
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(keywordInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  const completed = statusFilter === 'all' ? undefined : statusFilter === 'completed';

  const { data, isLoading } = useTasks({
    page,
    page_size: PAGE_SIZE,
    completed,
    keyword: keyword || undefined,
  });

  const tasks = data?.items;
  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 0;

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isLoggedIn = !!token && !!user;

  function handleStatusChange(next: StatusFilter) {
    setStatusFilter(next);
    setPage(1);
  }

  function handleDelete(id: number) {
    // 删除当前页最后一条时回退到上一页，避免停留在空白页。
    if (tasks?.length === 1 && page > 1) {
      setPage((p) => Math.max(1, p - 1));
    }
    deleteTask.mutate(id);
  }

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

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="搜索任务..."
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
        />
        <div className={styles.filterGroup}>
          {(
            [
              { value: 'all', label: '全部' },
              { value: 'active', label: '未完成' },
              { value: 'completed', label: '已完成' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              className={statusFilter === option.value ? styles.filterActive : styles.filterBtn}
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className={styles.empty}>加载中...</p>
      ) : tasks && tasks.length > 0 ? (
        <>
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
                  onClick={() => handleDelete(task.id)}
                  aria-label="删除"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              共 {total} 条 · 第 {page} / {totalPages} 页
            </span>
            <div className={styles.pageActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                上一页
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                下一页
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className={styles.empty}>
          {keyword || statusFilter !== 'all' ? '没有符合条件的任务' : '暂无任务，添加一个吧'}
        </p>
      )}
    </div>
  );
}
