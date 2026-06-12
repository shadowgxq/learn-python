import type { Ticket } from '../../model/ticket.types';
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  CATEGORY_LABEL,
  PRIORITY_TONE,
  STATUS_TONE,
} from '../../model/ticket.constants';
import { Trash2 } from '../../../../shared/icons';
import styles from './TicketList.module.css';

interface TicketListProps {
  tickets: Ticket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '/');
}

function isOverdue(ticket: Ticket): boolean {
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return false;
  }
  const today = new Date().toISOString().slice(0, 10);
  return ticket.dueDate < today;
}

export function TicketList({ tickets, selectedId, onSelect, onDelete }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <p className={styles.emptyText}>暂无工单</p>
        <p className={styles.emptyHint}>点击「新建工单」创建第一个工单</p>
      </div>
    );
  }

  return (
    <div className={styles.list} role="list" aria-label="工单列表">
      {tickets.map((ticket) => {
        const overdue = isOverdue(ticket);
        return (
          <div
            key={ticket.id}
            role="listitem"
            className={`${styles.item} ${selectedId === ticket.id ? styles.selected : ''} ${overdue ? styles.overdue : ''}`}
            onClick={() => onSelect(ticket.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(ticket.id);
              }
            }}
            tabIndex={0}
            aria-selected={selectedId === ticket.id}
          >
            <div className={styles.itemHeader}>
              <h3 className={styles.itemTitle}>{ticket.title}</h3>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(ticket.id);
                }}
                aria-label={`删除工单: ${ticket.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <p className={styles.customer}>{ticket.customerName}</p>

            <div className={styles.meta}>
              <span className={`${styles.badge} ${styles[PRIORITY_TONE[ticket.priority]]}`}>
                {PRIORITY_LABEL[ticket.priority]}
              </span>
              <span className={`${styles.badge} ${styles[STATUS_TONE[ticket.status]]}`}>
                {STATUS_LABEL[ticket.status]}
              </span>
              <span className={styles.category}>{CATEGORY_LABEL[ticket.category]}</span>
            </div>

            <div className={styles.footer}>
              <span className={styles.assignee}>{ticket.assignee}</span>
              <span className={styles.dates}>
                {formatDate(ticket.createdAt)}
                {overdue && <span className={styles.overdueTag}>逾期</span>}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
