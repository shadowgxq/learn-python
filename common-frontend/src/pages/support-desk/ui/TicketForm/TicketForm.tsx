import { useState, useCallback } from 'react';
import type { TicketFormData } from '../../model/ticket.types';
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  CATEGORY_OPTIONS,
  ASSIGNEE_OPTIONS,
} from '../../model/ticket.constants';
import { X } from '../../../../shared/icons';
import styles from './TicketForm.module.css';

interface TicketFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TicketFormData) => void;
}

interface FormErrors {
  title?: string;
  customerName?: string;
  dueDate?: string;
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

const INITIAL_FORM: TicketFormData = {
  title: '',
  customerName: '',
  priority: 'medium',
  status: 'pending',
  category: 'technical',
  assignee: '未分配',
  createdAt: getTodayString(),
  dueDate: '',
  description: '',
};

export function TicketForm({ open, onClose, onSubmit }: TicketFormProps) {
  const [form, setForm] = useState<TicketFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = useCallback(
    <K extends keyof TicketFormData>(key: K, value: TicketFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (submitted) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [submitted],
  );

  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};
    if (!form.title.trim()) {
      errs.title = '标题不能为空';
    }
    if (!form.customerName.trim()) {
      errs.customerName = '客户名称不能为空';
    }
    if (form.dueDate && form.dueDate < form.createdAt) {
      errs.dueDate = '期望解决日期不能早于创建日期';
    }
    return errs;
  }, [form]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
      onSubmit({
        ...form,
        title: form.title.trim(),
        customerName: form.customerName.trim(),
        description: form.description.trim(),
      });
      setForm(INITIAL_FORM);
      setErrors({});
      setSubmitted(false);
      onClose();
    },
    [form, validate, onSubmit, onClose],
  );

  const handleClose = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose();
      }}
      role="presentation"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="新建工单"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>新建工单</h2>
          <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="form-title">
              标题 <span className={styles.required}>*</span>
            </label>
            <input
              id="form-title"
              type="text"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              placeholder="请输入工单标题"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              autoFocus
            />
            {errors.title && <span className={styles.error}>{errors.title}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="form-customer">
              客户名称 <span className={styles.required}>*</span>
            </label>
            <input
              id="form-customer"
              type="text"
              className={`${styles.input} ${errors.customerName ? styles.inputError : ''}`}
              placeholder="请输入客户名称"
              value={form.customerName}
              onChange={(e) => updateField('customerName', e.target.value)}
            />
            {errors.customerName && <span className={styles.error}>{errors.customerName}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="form-priority">
                优先级
              </label>
              <select
                id="form-priority"
                className={styles.select}
                value={form.priority}
                onChange={(e) =>
                  updateField('priority', e.target.value as TicketFormData['priority'])
                }
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="form-status">
                状态
              </label>
              <select
                id="form-status"
                className={styles.select}
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as TicketFormData['status'])}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="form-category">
                分类
              </label>
              <select
                id="form-category"
                className={styles.select}
                value={form.category}
                onChange={(e) =>
                  updateField('category', e.target.value as TicketFormData['category'])
                }
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="form-assignee">
                负责人
              </label>
              <select
                id="form-assignee"
                className={styles.select}
                value={form.assignee}
                onChange={(e) => updateField('assignee', e.target.value)}
              >
                {ASSIGNEE_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="form-created">
                创建日期
              </label>
              <input
                id="form-created"
                type="date"
                className={styles.input}
                value={form.createdAt}
                onChange={(e) => updateField('createdAt', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="form-due">
                期望解决日期
              </label>
              <input
                id="form-due"
                type="date"
                className={`${styles.input} ${errors.dueDate ? styles.inputError : ''}`}
                value={form.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
              />
              {errors.dueDate && <span className={styles.error}>{errors.dueDate}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="form-desc">
              描述
            </label>
            <textarea
              id="form-desc"
              className={styles.textarea}
              placeholder="请描述问题详情..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>
              取消
            </button>
            <button type="submit" className={styles.submitBtn}>
              创建工单
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
