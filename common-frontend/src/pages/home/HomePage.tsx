import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p className={styles.eyebrow}>Python API Client</p>
        <h1 className={styles.title}>Todo App</h1>
        <p className={styles.description}>登录后管理任务，数据来自当前 Python 项目的 auth 和 tasks 接口。</p>

        <nav className={styles.nav}>
          <Link to="/todo">进入 Todo App →</Link>
        </nav>
      </main>
    </div>
  );
}
