// 工具：将逗号分隔的标签字符串标准化为数组；或将任意字符串数组清洗（trim/lower/去重）
export function parseTags(input: string | string[] | null | undefined): string[] {
  if (!input) return [];
  const parts = Array.isArray(input)
    ? input
    : String(input).split(',');
  const cleaned = parts
    .map((s) => (s ?? '').trim().toLowerCase())
    .filter((s) => s.length > 0);
  return Array.from(new Set(cleaned));
}
