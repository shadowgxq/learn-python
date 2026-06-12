import { useState, useCallback, useMemo } from 'react';
import type { Ticket, TicketFilters } from './ticket.types';
import { INITIAL_FILTERS } from './ticket.constants';

function isOverdue(ticket: Ticket): boolean {
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return false;
  }
  const today = new Date().toISOString().slice(0, 10);
  return ticket.dueDate < today;
}

export function useTicketFilters(tickets: Ticket[]) {
  const [filters, setFilters] = useState<TicketFilters>(INITIAL_FILTERS);

  const updateFilter = useCallback(
    <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filters.status !== 'all' && ticket.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'all' && ticket.priority !== filters.priority) {
        return false;
      }
      if (filters.category !== 'all' && ticket.category !== filters.category) {
        return false;
      }
      if (filters.assignee && ticket.assignee !== filters.assignee) {
        return false;
      }
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const match =
          ticket.title.toLowerCase().includes(kw) ||
          ticket.customerName.toLowerCase().includes(kw) ||
          ticket.description.toLowerCase().includes(kw);
        if (!match) return false;
      }
      if (filters.overdueOnly && !isOverdue(ticket)) {
        return false;
      }
      return true;
    });
  }, [tickets, filters]);

  return { filters, updateFilter, resetFilters, filteredTickets };
}
