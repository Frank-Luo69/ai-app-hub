import { describe, it, expect } from 'vitest';
import { canManageApp } from '@/lib/authz';

describe('canManageApp', () => {
  it('denies when not logged in', () => {
    expect(canManageApp({ userId: null, ownerId: '1', isAdmin: false })).toBe(false);
  });
  it('allows admin', () => {
    expect(canManageApp({ userId: 'u', ownerId: '1', isAdmin: true })).toBe(true);
  });
  it('allows owner', () => {
    expect(canManageApp({ userId: 'u', ownerId: 'u', isAdmin: false })).toBe(true);
  });
  it('denies others', () => {
    expect(canManageApp({ userId: 'u', ownerId: 'v', isAdmin: false })).toBe(false);
  });
});
