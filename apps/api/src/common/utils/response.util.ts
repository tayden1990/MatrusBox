export function formatResponse<T>(data: T, meta?: Record<string, any>) {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function formatList<T>(items: T[], meta: Record<string, any>) {
  return { success: true, data: items, meta };
}
