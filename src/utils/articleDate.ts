export function articleDate(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return undefined;
  const calendar = new Date(value.slice(0, 10));
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== value.slice(0, 10)) return undefined;
  return date.toISOString();
}
