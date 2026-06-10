import { describe, it, expect } from 'vitest';
import { migrate } from '@/lib/store/migrations';

describe('migrate (v1 → v2)', () => {
  it('backfills clawId: null on tasks and memories', () => {
    const v1 = {
      tasks: [{ id: 't1', title: 'A' }],
      memories: [{ id: 'm1', title: 'M' }],
    };
    const out = migrate(v1, 1);
    expect((out.tasks as Array<{ clawId: unknown }>)[0].clawId).toBeNull();
    expect((out.memories as Array<{ clawId: unknown }>)[0].clawId).toBeNull();
  });

  it('initializes selectedClawId to null', () => {
    expect(migrate({}, 1).selectedClawId).toBeNull();
  });

  it('preserves an existing clawId instead of overwriting it', () => {
    const v1 = { tasks: [{ id: 't1', clawId: 'claw-7' }] };
    const out = migrate(v1, 1);
    expect((out.tasks as Array<{ clawId: unknown }>)[0].clawId).toBe('claw-7');
  });

  it('keeps all other task fields intact', () => {
    const v1 = { tasks: [{ id: 't1', title: 'Keep me', priority: 'high' }] };
    const task = (migrate(v1, 1).tasks as Array<Record<string, unknown>>)[0];
    expect(task.title).toBe('Keep me');
    expect(task.priority).toBe('high');
  });

  it('is a no-op for blobs already at v2', () => {
    const v2 = { tasks: [{ id: 't1', clawId: 'c1' }], selectedClawId: 'c1' };
    const out = migrate(v2, 2);
    expect(out.selectedClawId).toBe('c1');
    expect((out.tasks as Array<{ clawId: unknown }>)[0].clawId).toBe('c1');
  });

  it('tolerates an empty / undefined persisted blob', () => {
    expect(() => migrate(undefined, 1)).not.toThrow();
    expect(migrate(undefined, 1).selectedClawId).toBeNull();
  });

  it('tolerates a blob with no tasks/memories arrays', () => {
    const out = migrate({ wizardCompleted: true }, 1);
    expect(out.wizardCompleted).toBe(true);
    expect(out.selectedClawId).toBeNull();
  });
});
