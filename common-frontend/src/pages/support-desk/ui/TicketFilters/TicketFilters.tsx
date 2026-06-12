import type { TicketFilters as TicketFiltersType } from '../../model/ticket.types';
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
  ASSIGNEE_OPTIONS,
} from '../../model/ticket.constants';
import { Search } from '../../../../shared/icons';
import styles from './TicketFilters.module.css';

interface TicketFiltersProps {
  filters: TicketFiltersType;
  onFilterChange: <K extends keyof TicketFiltersType>(key: K, value: TicketFiltersType[K]) => void;
  onReset: () => void;
}

export function TicketFilters({ filters, onFilterChange, onReset }: TicketFiltersProps) {
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    filters.assignee !== '' ||
    filters.keyword !== '' ||
    filters.overdueOnly;

  return (
    <aside className={styles.filters} role="search" aria-label="工单筛选">
      <div className={styles.header}>
        <h2 className={styles.title}>筛选</h2>
        {hasActiveFilters && (
          <button type="button" className={styles.resetBtn} onClick={onReset}>
            重置
          </button>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-keyword">
          关键词搜索
        </label>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            id="filter-keyword"
            type="text"
            className={styles.searchInput}
            placeholder="搜索标题、客户、描述..."
            value={filters.keyword}
            onChange={(e) => onFilterChange('keyword', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-status">
          状态
        </label>
        <select
          id="filter-status"
          className={styles.select}
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value as TicketFiltersType['status'])}
        >
          <option value="all">全部状态</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-priority">
          优先级
        </label>
        <select
          id="filter-priority"
          className={styles.select}
          value={filters.priority}
          onChange={(e) =>
            onFilterChange('priority', e.target.value as TicketFiltersType['priority'])
          }
        >
          <option value="all">全部优先级</option>
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-category">
          分类
        </label>
        <select
          id="filter-category"
          className={styles.select}
          value={filters.category}
          onChange={(e) =>
            onFilterChange('category', e.target.value as TicketFiltersType['category'])
          }
        >
          <option value="all">全部分类</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-assignee">
          负责人
        </label>
        <select
          id="filter-assignee"
          className={styles.select}
          value={filters.assignee}
          onChange={(e) => onFilterChange('assignee', e.target.value)}
        >
          <option value="">全部负责人</option>
          {ASSIGNEE_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => onFilterChange('overdueOnly', e.target.checked)}
          />
          <span>只看逾期</span>
        </label>
      </div>
    </aside>
  );
}
