import { useState, useCallback } from 'react';
import { useTickets } from './model/useTickets';
import { useTicketFilters } from './model/useTicketFilters';
import { TicketStats } from './ui/TicketStats';
import { TicketFilters } from './ui/TicketFilters';
import { TicketList } from './ui/TicketList';
import { TicketDetail } from './ui/TicketDetail';
import { TicketForm } from './ui/TicketForm';
import { Plus } from '../../shared/icons';
import styles from './SupportDeskPage.module.css';

export default function SupportDeskPage() {
  const {
    tickets,
    stats,
    addTicket,
    deleteTicket,
    updateTicketStatus,
    updateTicketAssignee,
    addNote,
  } = useTickets();

  const { filters, updateFilter, resetFilters, filteredTickets } = useTicketFilters(tickets);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const selectedTicket = tickets.find((t) => t.id === selectedId) ?? null;

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteTicket(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [deleteTicket, selectedId],
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>客服工单处理台</h1>
        <button type="button" className={styles.createBtn} onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          <span>新建工单</span>
        </button>
      </header>

      <TicketStats stats={stats} />

      <div className={styles.body}>
        <TicketFilters filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />

        <main className={styles.main}>
          <div className={styles.listHeader}>
            <span className={styles.listCount}>{filteredTickets.length} 个工单</span>
          </div>
          <TicketList
            tickets={filteredTickets}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        </main>

        <TicketDetail
          ticket={selectedTicket}
          onStatusChange={updateTicketStatus}
          onAssigneeChange={updateTicketAssignee}
          onAddNote={addNote}
        />
      </div>

      <TicketForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={addTicket} />
    </div>
  );
}
