import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const templateSections = [
  {
    title: 'App Shell',
    text: 'Keep app-level providers, routing, global styles, and error boundaries in src/app.',
  },
  {
    title: 'Layered Source',
    text: 'Compose pages from widgets, features, entities, and shared modules with clear import direction.',
  },
  {
    title: 'Project Docs',
    text: 'Move business PRD, API contracts, and acceptance criteria into the target project docs.',
  },
];

export function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p className={styles.eyebrow}>Vite + React + TypeScript</p>
        <h1 className={styles.title}>Frontend agent template is ready.</h1>
        <p className={styles.description}>
          This starter keeps the runtime app intentionally small while preserving the project
          structure, documentation, and adoption workflow expected by the template.
        </p>

        <nav className={styles.nav}>
          <Link to="/todo">Todo App →</Link>
          <Link to="/support-desk-demo">Support Desk Demo →</Link>
          <Link to="/dashboard">Dashboard 大屏 →</Link>
        </nav>

        <section className={styles.panel} aria-label="Template structure">
          {templateSections.map((section) => (
            <article className={styles.item} key={section.title}>
              <h2 className={styles.itemTitle}>{section.title}</h2>
              <p className={styles.itemText}>{section.text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
