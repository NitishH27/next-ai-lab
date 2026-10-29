import 'server-only';

import { ObjectId } from 'mongodb';

export function serializeId(id: unknown): string {
  if (id instanceof ObjectId) {
    return id.toHexString();
  }
  if (typeof id === 'string') {
    return id;
  }
  if (id && typeof id === 'object' && 'toString' in id) {
    return String((id as { toString: () => string }).toString());
  }
  return String(id);
}

export function serializeDate(date: unknown): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'string') {
    return date;
  }
  if (date && typeof date === 'object') {
    const d = date as { toISOString?: () => string };
    if (typeof d.toISOString === 'function') return d.toISOString();
  }
  return new Date(String(date)).toISOString();
}

export function serializeApplication(doc: Record<string, unknown>) {
  return {
    id: serializeId(doc._id),
    company: doc.company as string,
    role: doc.role as string,
    appliedAt: serializeDate(doc.appliedAt),
    status: doc.status as string,
    statusChangedAt: serializeDate(doc.statusChangedAt),
  };
}
