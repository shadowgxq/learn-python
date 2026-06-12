import type { TicketPriority, TicketStatus, TicketCategory, TicketFilters } from './ticket.types';

export const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
];

export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'pending', label: '待分配' },
  { value: 'in-progress', label: '处理中' },
  { value: 'waiting-customer', label: '等待客户' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' },
];

export const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: 'technical', label: '技术问题' },
  { value: 'billing', label: '账单相关' },
  { value: 'account', label: '账户问题' },
  { value: 'feature-request', label: '功能建议' },
  { value: 'other', label: '其他' },
];

export const ASSIGNEE_OPTIONS = ['张三', '李四', '王五', '赵六', '未分配'] as const;

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const STATUS_LABEL: Record<TicketStatus, string> = {
  pending: '待分配',
  'in-progress': '处理中',
  'waiting-customer': '等待客户',
  resolved: '已解决',
  closed: '已关闭',
};

export const CATEGORY_LABEL: Record<TicketCategory, string> = {
  technical: '技术问题',
  billing: '账单相关',
  account: '账户问题',
  'feature-request': '功能建议',
  other: '其他',
};

export const PRIORITY_TONE: Record<TicketPriority, string> = {
  low: 'tone-low',
  medium: 'tone-medium',
  high: 'tone-high',
  urgent: 'tone-urgent',
};

export const STATUS_TONE: Record<TicketStatus, string> = {
  pending: 'tone-pending',
  'in-progress': 'tone-in-progress',
  'waiting-customer': 'tone-waiting',
  resolved: 'tone-resolved',
  closed: 'tone-closed',
};

export const INITIAL_FILTERS: TicketFilters = {
  status: 'all',
  priority: 'all',
  category: 'all',
  assignee: '',
  keyword: '',
  overdueOnly: false,
};

export const STORAGE_KEY = 'support-desk-tickets';
