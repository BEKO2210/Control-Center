import { describe, it, expect } from 'vitest';
import {
  capitalize,
  generateId,
  toLabel,
  truncate,
} from '@/lib/utils';

describe('truncate', () => {
  it('leaves short strings unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('adds an ellipsis when over the limit', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
    expect(truncate('hello world', 8)).toHaveLength(8);
  });

  it('hard-truncates without ellipsis when maxLength <= 3', () => {
    // Regression: avoid producing "..." (or longer) for tiny limits.
    expect(truncate('hello', 2)).toBe('he');
    expect(truncate('hello', 3)).toBe('hel');
    expect(truncate('hello', 0)).toBe('');
  });
});

describe('capitalize', () => {
  it('uppercases the first character only', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('h')).toBe('H');
  });

  it('returns empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('toLabel', () => {
  it('title-cases snake_case identifiers', () => {
    expect(toLabel('in_progress')).toBe('In Progress');
    expect(toLabel('code_review_wizard')).toBe('Code Review Wizard');
  });

  it('capitalizes a single word', () => {
    expect(toLabel('done')).toBe('Done');
  });
});

describe('generateId', () => {
  it('prefixes the id and produces unique values', () => {
    const a = generateId('task');
    const b = generateId('task');
    expect(a.startsWith('task-')).toBe(true);
    expect(a).not.toBe(b);
  });

  it('defaults the prefix to "id"', () => {
    expect(generateId().startsWith('id-')).toBe(true);
  });
});
