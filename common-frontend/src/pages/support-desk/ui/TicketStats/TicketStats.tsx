import type { TicketStats as TicketStatsType } from '../../model/ticket.types';
import styles from './TicketStats.module.css';

interface TicketStatsProps {
  stats: TicketStatsType;
}

export function TicketStats({ stats }: TicketStatsProps) {
  const cards = [
    { label: '工单总数', value: stats.total, tone: '' },
    { label: '紧急工单', value: stats.urgentCount, tone: 'tone-urgent' },
    { label: '逾期未解决', value: stats.overdueCount, tone: 'tone-overdue' },
    { label: '今日新增', value: stats.todayNewCount, tone: 'tone-new' },
    {
      label: '已解决率',
      value: `${stats.resolvedRate}%`,
      tone: 'tone-resolved',
    },
  ];

  return (
    <div className={styles.stats} role="region" aria-label="工单统计">
      {cards.map((card) => (
        <div key={card.label} className={`${styles.card} ${card.tone ? styles[card.tone] : ''}`}>
          <span className={styles.value}>{card.value}</span>
          <span className={styles.label}>{card.label}</span>
        </div>
      ))}
    </div>
  );
}
