import { describe, it, expect } from 'vitest';
import { filterByQuery, filterByTag, paginate } from '@/lib/filters';

describe('filters', () => {
  const apps = [
    { id: '1', title: 'ChatGPT Wrapper', description: 'A cool tool', tags: ['ai', 'chat'] },
    { id: '2', title: 'Image Magic', description: 'Convert and edit images', tags: ['image'] },
    { id: '3', title: 'Note Taker', description: 'Keep notes', tags: ['productivity'] },
  ];

  it('filterByQuery matches title and description', () => {
    expect(filterByQuery(apps as any, 'chat').map(a => a.id)).toEqual(['1']);
    expect(filterByQuery(apps as any, 'image').map(a => a.id)).toEqual(['2']);
    expect(filterByQuery(apps as any, 'keep').map(a => a.id)).toEqual(['3']);
  });

  it('filterByTag filters by tag', () => {
    expect(filterByTag(apps as any, 'ai').map(a => a.id)).toEqual(['1']);
    expect(filterByTag(apps as any, 'image').map(a => a.id)).toEqual(['2']);
    expect(filterByTag(apps as any, '').length).toEqual(3);
  });

  it('paginate slices by page and size', () => {
    const rows = Array.from({ length: 10 }, (_, i) => i + 1);
    expect(paginate(rows, 1, 3)).toEqual([1,2,3]);
    expect(paginate(rows, 2, 3)).toEqual([4,5,6]);
    expect(paginate(rows, 4, 3)).toEqual([10]);
  });
});
