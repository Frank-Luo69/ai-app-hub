import { z } from 'zod';

export const appFormSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题过长'),
  description: z.string().max(2000, '简介过长').optional().or(z.literal('')),
  play_url: z.string().url('链接格式不正确，必须是 http(s):// 开头'),
  cover_url: z.string().url('封面链接需为有效 URL').optional().or(z.literal('')),
  tags: z.array(z.string().min(1)).max(20, '标签过多').optional().default([]),
  status: z.enum(['active', 'draft']).optional().default('active'),
});

export function parseTagsInput(input: string): string[] {
  return (input || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}
