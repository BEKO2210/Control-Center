'use client';

import { useState } from 'react';
import { useMissionControl } from '@/lib/store';
import type { ReviewCategory, ReviewCheckItem, ReviewSeverity } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Shield,
  Zap,
  Code2,
  TestTube2,
  FileText,
  Layers,
  AlertTriangle,
  Accessibility,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// --- Category icons/colors ---

const CATEGORY_META: Record<ReviewCategory, { label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }> = {
  'code-quality': { label: 'Code Quality', icon: Code2, color: '#8b5cf6' },
  'security': { label: 'Security', icon: Shield, color: '#ef4444' },
  'performance': { label: 'Performance', icon: Zap, color: '#f59e0b' },
  'testing': { label: 'Testing', icon: TestTube2, color: '#10b981' },
  'documentation': { label: 'Documentation', icon: FileText, color: '#3b82f6' },
  'architecture': { label: 'Architecture', icon: Layers, color: '#06b6d4' },
  'error-handling': { label: 'Error Handling', icon: AlertTriangle, color: '#f97316' },
  'accessibility': { label: 'Accessibility', icon: Accessibility, color: '#ec4899' },
};

function severityColor(s: ReviewSeverity): string {
  switch (s) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'suggestion': return '#3b82f6';
    case 'info': return '#6b7280';
  }
}

export function CodeReviewDashboard() {
  const reviewProfiles = useMissionControl((s) => s.reviewProfiles);
  const activeReviewProfileId = useMissionControl((s) => s.activeReviewProfileId);
  const setActiveReviewProfile = useMissionControl((s) => s.setActiveReviewProfile);
  const deleteReviewProfile = useMissionControl((s) => s.deleteReviewProfile);
  const setActiveScreen = useMissionControl((s) => s.setActiveScreen);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const activeProfile = reviewProfiles.find((p) => p.id === activeReviewProfileId) || reviewProfiles[0];

  const toggleExpand = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleChecked = (checkId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(checkId)) next.delete(checkId);
      else next.add(checkId);
      return next;
    });
  };

  const resetChecklist = () => {
    setCheckedItems(new Set());
  };

  if (!activeProfile) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center py-20">
        <ClipboardCheck className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} />
        <h2 className="text-xl font-bold text-white mb-2">No Review Profiles Yet</h2>
        <p className="text-sm text-gray-400 mb-6">
          Create your first code review profile using the wizard.
        </p>
        <button
          onClick={() => setActiveScreen('code-review-wizard')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Profile
        </button>
      </div>
    );
  }

  // Group checks by category
  const groupedChecks: Record<string, ReviewCheckItem[]> = {};
  activeProfile.checks.forEach((c) => {
    if (!groupedChecks[c.category]) groupedChecks[c.category] = [];
    groupedChecks[c.category].push(c);
  });

  const totalChecks = activeProfile.checks.length;
  const completedChecks = activeProfile.checks.filter((c) => checkedItems.has(c.id)).length;
  const progress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : 0;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Code Review</h1>
          <p className="text-sm text-gray-400">Track your review progress</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetChecklist}
            className="btn-ghost text-xs"
          >
            Reset
          </button>
          <button
            onClick={() => setActiveScreen('code-review-wizard')}
            className="btn-primary text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Profile
          </button>
        </div>
      </div>

      {/* Profile selector */}
      {reviewProfiles.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {reviewProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => {
                setActiveReviewProfile(profile.id);
                setCheckedItems(new Set());
              }}
              className={cn(
                'glass-panel px-4 py-2 text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2',
                profile.id === activeProfile.id ? 'ring-1' : 'opacity-60 hover:opacity-100',
              )}
              style={{
                borderColor: profile.id === activeProfile.id ? 'var(--accent-primary)' : undefined,
              }}
            >
              {profile.name}
              {profile.id === activeProfile.id && (
                <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Progress card */}
      <div className="glass-panel p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">{activeProfile.name}</h2>
            <p className="text-xs text-gray-500">{activeProfile.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {completedChecks}/{totalChecks}
            </p>
            <p className="text-[10px] text-gray-500">checks completed</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--glass-heavy)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? '#10b981'
                : progress > 50
                  ? 'var(--accent-primary)'
                  : '#f59e0b',
              boxShadow: progress === 100 ? '0 0 10px rgba(16,185,129,0.4)' : '0 0 10px var(--accent-glow)',
            }}
          />
        </div>
        {progress === 100 && (
          <p className="text-xs text-green-400 mt-2 font-medium">All checks completed!</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(['critical', 'warning', 'suggestion', 'info'] as ReviewSeverity[]).map((sev) => {
          const sevChecks = activeProfile.checks.filter((c) => c.severity === sev);
          const sevCompleted = sevChecks.filter((c) => checkedItems.has(c.id)).length;
          return (
            <div key={sev} className="glass-panel p-3 text-center">
              <p className="text-lg font-bold" style={{ color: severityColor(sev) }}>
                {sevCompleted}/{sevChecks.length}
              </p>
              <p className="text-[10px] text-gray-500 capitalize">{sev}</p>
            </div>
          );
        })}
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {Object.entries(groupedChecks).map(([catId, catChecks]) => {
          const meta = CATEGORY_META[catId as ReviewCategory];
          if (!meta) return null;
          const Icon = meta.icon;
          const isExpanded = expandedCategories.has(catId);
          const catCompleted = catChecks.filter((c) => checkedItems.has(c.id)).length;

          return (
            <div key={catId} className="glass-panel overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleExpand(catId)}
                className="w-full flex items-center gap-3 p-4 text-left transition-all hover:bg-white/[0.02]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${meta.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">{meta.label}</h3>
                  <p className="text-[10px] text-gray-500">{catCompleted} / {catChecks.length} completed</p>
                </div>
                {/* Mini progress */}
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-heavy)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${catChecks.length > 0 ? (catCompleted / catChecks.length) * 100 : 0}%`,
                      background: meta.color,
                    }}
                  />
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Expanded checks */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-1">
                  {catChecks.map((check) => {
                    const isDone = checkedItems.has(check.id);
                    return (
                      <button
                        key={check.id}
                        onClick={() => toggleChecked(check.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all',
                          isDone ? 'opacity-60' : 'opacity-100',
                        )}
                        style={{ background: isDone ? 'var(--glass-light)' : 'transparent' }}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-green-400" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 flex-shrink-0 text-gray-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm', isDone ? 'text-gray-500 line-through' : 'text-white')}>
                              {check.title}
                            </span>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: `${severityColor(check.severity)}15`, color: severityColor(check.severity) }}
                            >
                              {check.severity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{check.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete profile */}
      {reviewProfiles.length > 1 && (
        <div className="mt-8 pt-6 border-t flex justify-end" style={{ borderColor: 'var(--glass-border)' }}>
          <button
            onClick={() => {
              if (activeProfile) {
                deleteReviewProfile(activeProfile.id);
                setCheckedItems(new Set());
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Profile
          </button>
        </div>
      )}
    </div>
  );
}
