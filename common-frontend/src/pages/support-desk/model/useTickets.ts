import { useState, useCallback, useMemo } from 'react';
import type { Ticket, TicketFormData, TicketNote, TicketStats } from './ticket.types';
import { STORAGE_KEY } from './ticket.constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Ticket[]) : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets: Ticket[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(ticket: Ticket): boolean {
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return false;
  }
  return ticket.dueDate < getTodayString();
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(loadTickets);

  const persist = useCallback((next: Ticket[]) => {
    setTickets(next);
    saveTickets(next);
  }, []);

  const addTicket = useCallback(
    (data: TicketFormData) => {
      const ticket: Ticket = {
        ...data,
        id: generateId(),
        notes: [],
      };
      persist([ticket, ...tickets]);
    },
    [tickets, persist],
  );

  const deleteTicket = useCallback(
    (id: string) => {
      persist(tickets.filter((t) => t.id !== id));
    },
    [tickets, persist],
  );

  const updateTicketStatus = useCallback(
    (id: string, status: Ticket['status']) => {
      persist(tickets.map((t) => (t.id === id ? { ...t, status } : t)));
    },
    [tickets, persist],
  );

  const updateTicketAssignee = useCallback(
    (id: string, assignee: string) => {
      persist(tickets.map((t) => (t.id === id ? { ...t, assignee } : t)));
    },
    [tickets, persist],
  );

  const addNote = useCallback(
    (ticketId: string, content: string) => {
      const note: TicketNote = {
        id: generateId(),
        content,
        createdAt: new Date().toISOString(),
      };
      persist(tickets.map((t) => (t.id === ticketId ? { ...t, notes: [...t.notes, note] } : t)));
    },
    [tickets, persist],
  );

  const stats: TicketStats = useMemo(() => {
    const today = getTodayString();
    const total = tickets.length;
    const urgentCount = tickets.filter((t) => t.priority === 'urgent').length;
    const overdueCount = tickets.filter(isOverdue).length;
    const todayNewCount = tickets.filter((t) => t.createdAt === today).length;
    const resolvedCount = tickets.filter(
      (t) => t.status === 'resolved' || t.status === 'closed',
    ).length;
    const resolvedRate = total === 0 ? 0 : Math.round((resolvedCount / total) * 100);

    return { total, urgentCount, overdueCount, todayNewCount, resolvedRate };
  }, [tickets]);

  return {
    tickets,
    stats,
    addTicket,
    deleteTicket,
    updateTicketStatus,
    updateTicketAssignee,
    addNote,
  };
}
