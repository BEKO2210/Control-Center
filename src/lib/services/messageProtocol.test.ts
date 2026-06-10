import { describe, it, expect } from 'vitest';
import {
  coerceAgentArray,
  normalizeInboundMessage,
  safeActivity,
  safeRole,
  safeStatus,
} from '@/lib/services/messageProtocol';

describe('coerceAgentArray', () => {
  it('returns a bare array unchanged', () => {
    const arr = [{ id: 'a1' }, { id: 'a2' }];
    expect(coerceAgentArray(arr)).toEqual(arr);
  });

  it('unwraps { agents: [...] }', () => {
    expect(coerceAgentArray({ agents: [{ id: 'a1' }] })).toEqual([{ id: 'a1' }]);
  });

  it('unwraps { data: [...] }', () => {
    expect(coerceAgentArray({ data: [{ id: 'a1' }] })).toEqual([{ id: 'a1' }]);
  });

  it('returns [] for null, primitives, and shapeless objects', () => {
    expect(coerceAgentArray(null)).toEqual([]);
    expect(coerceAgentArray(42)).toEqual([]);
    expect(coerceAgentArray('nope')).toEqual([]);
    expect(coerceAgentArray({ other: 1 })).toEqual([]);
  });

  it('prefers `agents` over `data` when both exist', () => {
    expect(
      coerceAgentArray({ agents: [{ id: 'fromAgents' }], data: [{ id: 'fromData' }] }),
    ).toEqual([{ id: 'fromAgents' }]);
  });
});

describe('safeActivity', () => {
  it('passes through valid activities', () => {
    expect(safeActivity('building')).toBe('building');
    expect(safeActivity('idle')).toBe('idle');
  });

  it('rejects unknown / wrong-typed values with null', () => {
    expect(safeActivity('dancing')).toBeNull();
    expect(safeActivity(undefined)).toBeNull();
    expect(safeActivity(7)).toBeNull();
  });
});

describe('safeStatus', () => {
  it('passes through valid task statuses', () => {
    expect(safeStatus('review')).toBe('review');
    expect(safeStatus('done')).toBe('done');
  });

  it('rejects unknown values with null', () => {
    expect(safeStatus('archived')).toBeNull();
    expect(safeStatus(null)).toBeNull();
  });
});

describe('safeRole', () => {
  it('passes through valid roles', () => {
    expect(safeRole('developer')).toBe('developer');
  });

  it('defaults unknown roles to operator', () => {
    expect(safeRole('martian')).toBe('operator');
    expect(safeRole(undefined)).toBe('operator');
  });
});

describe('normalizeInboundMessage', () => {
  it('returns null for non-objects and untyped objects', () => {
    expect(normalizeInboundMessage(null)).toBeNull();
    expect(normalizeInboundMessage('hi')).toBeNull();
    expect(normalizeInboundMessage({ noType: true })).toBeNull();
  });

  it('decodes a task_update with the new `payload` shape', () => {
    expect(
      normalizeInboundMessage({ type: 'task_update', payload: { id: 't1' } }),
    ).toEqual({ type: 'task_update', payload: { id: 't1' } });
  });

  it('decodes the legacy `data` wrapper', () => {
    expect(
      normalizeInboundMessage({ type: 'task_update', data: { id: 't9' } }),
    ).toEqual({ type: 'task_update', payload: { id: 't9' } });
  });

  it('maps agent_update alias onto agent_status', () => {
    const msg = normalizeInboundMessage({
      type: 'agent_update',
      payload: { id: 'a1', activity: 'thinking' },
    });
    expect(msg).toEqual({
      type: 'agent_status',
      payload: { id: 'a1', activity: 'thinking' },
    });
  });

  it('coerces agents / agents_list payloads to an array', () => {
    expect(
      normalizeInboundMessage({ type: 'agents', data: { agents: [{ id: 'a1' }] } }),
    ).toEqual({ type: 'agents_list', payload: [{ id: 'a1' }] });
  });

  it('defaults a status message with no payload to {}', () => {
    expect(normalizeInboundMessage({ type: 'status' })).toEqual({
      type: 'status',
      payload: {},
    });
  });

  it('treats health as a status snapshot', () => {
    expect(
      normalizeInboundMessage({ type: 'health', data: { online: true } }),
    ).toEqual({ type: 'status', payload: { online: true } });
  });

  it.each(['heartbeat', 'pong', 'ping'])(
    'maps transport alias %s onto heartbeat',
    (type) => {
      expect(normalizeInboundMessage({ type })?.type).toBe('heartbeat');
    },
  );

  it('returns null for unknown message types', () => {
    expect(normalizeInboundMessage({ type: 'totally_unknown' })).toBeNull();
  });
});
