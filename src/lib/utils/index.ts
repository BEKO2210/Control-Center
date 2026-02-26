// ============================================================================
// Clawbot Mission Control — Utility Functions
// ============================================================================

import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names with clsx (tailwind-merge compatible).
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Generate a unique ID with optional prefix.
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date string to a relative time (e.g., "2 hours ago").
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a status/role to a display label.
 */
export function toLabel(str: string): string {
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Get a label for agent activity.
 */
export function getActivityIcon(activity: string): string {
  const labels: Record<string, string> = {
    idle: 'ZZZ',
    thinking: 'THK',
    building: 'BLD',
    reviewing: 'REV',
    blocked: 'BLK',
  };
  return labels[activity] || 'ACT';
}

/**
 * Get priority color class.
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: 'text-red-400 bg-red-400/10 border-red-400/20',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    low: 'text-green-400 bg-green-400/10 border-green-400/20',
  };
  return colors[priority] || colors.medium;
}

/**
 * Get status color class.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idea: 'text-purple-400 bg-purple-400/10',
    queued: 'text-blue-400 bg-blue-400/10',
    in_progress: 'text-yellow-400 bg-yellow-400/10',
    review: 'text-orange-400 bg-orange-400/10',
    done: 'text-green-400 bg-green-400/10',
  };
  return colors[status] || '';
}

/**
 * Truncate text to a max length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}
