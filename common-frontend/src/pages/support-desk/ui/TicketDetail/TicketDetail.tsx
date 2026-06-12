import { useState } from 'react';
import type { Ticket } from '../../model/ticket.types';
import {
  STATUS_OPTIONS,
  ASSIGNEE_OPTIONS,
  PRIORITY_LABEL,
  STATUS_LABEL,
  CATEGORY_LABEL,
  PRIORITY_TONE,
  STATUS_TONE,
} from '../../model/ticket.constants';
import styles from './TicketDetail.module.css';

interface TicketDetailProps {
  ticket: Ticket | null;
  onStatusChange: (id: string, status: Ticket['status']) => void;
  onAssigneeChange: (id: string, assignee: string) => void;
  onAddNote: (ticketId: string, content: string) => void;
}

function formatDateTime(isoStr: string): string {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '/');
}

export function TicketDetail({
  ticket,
  onStatusChange,
  onAssigneeChange,
  onAddNote,
}: TicketDetailProps) {
  const [noteContent, setNoteContent] = useState('');

  if (!ticket) {
    return (
      <div className={styles.placeholder} role="status">
        <p className={styles.placeholderText}>选择一个工单查看详情</p>
        <p className={styles.placeholderHint}>从左侧列表中点击工单即可查看详细信息</p>
      </div>
    );
  }

  const handleAddNote = () => {
    const trimmed = noteContent.trim();
    if (!trimmed) return;
    onAddNote(ticket.id, trimmed);
    setNoteContent('');
  };

  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <h2 className={styles.title}>{ticket.title}</h2>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles[PRIORITY_TONE[ticket.priority]]}`}>
            {PRIORITY_LABEL[ticket.priority]}
          </span>
          <span className={`${styles.badge} ${styles[STATUS_TONE[ticket.status]]}`}>
            {STATUS_LABEL[ticket.status]}
          </span>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>客户名称</span>
          <span className={styles.infoValue}>{ticket.customerName}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>分类</span>
          <span className={styles.infoValue}>{CATEGORY_LABEL[ticket.category]}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>创建日期</span>
          <span className={styles.infoValue}>{formatDate(ticket.createdAt)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>期望解决日期</span>
          <span className={styles.infoValue}>{formatDate(ticket.dueDate)}</span>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>描述</span>
        <p className={styles.description}>{ticket.description}</p>
      </div>

      <div className={styles.actions}>
        <div className={styles.actionField}>
          <label className={styles.actionLabel} htmlFor="detail-status">
            修改状态
          </label>
          <select
            id="detail-status"
            className={styles.select}
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value as Ticket['status'])}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.actionField}>
          <label className={styles.actionLabel} htmlFor="detail-assignee">
            修改负责人
          </label>
          <select
            id="detail-assignee"
            className={styles.select}
            value={ticket.assignee}
            onChange={(e) => onAssigneeChange(ticket.id, e.target.value)}
          >
            {ASSIGNEE_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>内部备注</span>
        <div className={styles.noteInput}>
          <textarea
            className={styles.textarea}
            placeholder="添加内部备注..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={3}
          />
          <button
            type="button"
            className={styles.noteBtn}
            disabled={!noteContent.trim()}
            onClick={handleAddNote}
          >
            添加
          </button>
        </div>
      </div>

      {ticket.notes.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>备注时间线</span>
          <div className={styles.timeline}>
            {ticket.notes.map((note) => (
              <div key={note.id} className={styles.timelineItem}>
                <span className={styles.timelineTime}>{formatDateTime(note.createdAt)}</span>
                <p className={styles.timelineContent}>{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
