export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 'pending' | 'in-progress' | 'waiting-customer' | 'resolved' | 'closed';

export type TicketCategory = 'technical' | 'billing' | 'account' | 'feature-request' | 'other';

export interface TicketNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  customerName: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  assignee: string;
  createdAt: string;
  dueDate: string;
  description: string;
  notes: TicketNote[];
}

export interface TicketFormData {
  title: string;
  customerName: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  assignee: string;
  createdAt: string;
  dueDate: string;
  description: string;
}

export interface TicketFilters {
  status: TicketStatus | 'all';
  priority: TicketPriority | 'all';
  category: TicketCategory | 'all';
  assignee: string;
  keyword: string;
  overdueOnly: boolean;
}

export interface TicketStats {
  total: number;
  urgentCount: number;
  overdueCount: number;
  todayNewCount: number;
  resolvedRate: number;
}
