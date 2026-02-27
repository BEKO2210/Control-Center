'use client';

import { useState, useMemo } from 'react';
import { useMissionControl } from '@/lib/store';
import type { ReviewCategory, ReviewCheckItem, ReviewSeverity } from '@/lib/types';
import { cn, generateId } from '@/lib/utils';
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
  ChevronRight,
  Sparkles,
  Settings2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Search,
  ClipboardCheck,
} from 'lucide-react';

// --- Category Metadata ---

interface CategoryMeta {
  id: ReviewCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: 'code-quality',
    label: 'Code Quality',
    description: 'Naming, readability, DRY, SOLID, clean code principles',
    icon: Code2,
    color: '#8b5cf6',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Input validation, auth, injection, XSS, secrets management',
    icon: Shield,
    color: '#ef4444',
  },
  {
    id: 'performance',
    label: 'Performance',
    description: 'Algorithm complexity, N+1 queries, caching, memory leaks',
    icon: Zap,
    color: '#f59e0b',
  },
  {
    id: 'testing',
    label: 'Testing',
    description: 'Unit tests, integration, coverage, mocking, test quality',
    icon: TestTube2,
    color: '#10b981',
  },
  {
    id: 'documentation',
    label: 'Documentation',
    description: 'API docs, inline comments, README, changelogs, ADRs',
    icon: FileText,
    color: '#3b82f6',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    description: 'Separation of concerns, coupling, dependency direction',
    icon: Layers,
    color: '#06b6d4',
  },
  {
    id: 'error-handling',
    label: 'Error Handling',
    description: 'Graceful degradation, retries, logging, user messages',
    icon: AlertTriangle,
    color: '#f97316',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'WCAG compliance, ARIA, keyboard navigation, screen readers',
    icon: Accessibility,
    color: '#ec4899',
  },
];

// --- Default Checks per Category ---

interface CheckTemplate {
  title: string;
  description: string;
  severity: ReviewSeverity;
  category: ReviewCategory;
}

const DEFAULT_CHECKS: CheckTemplate[] = [
  // Code Quality
  { category: 'code-quality', severity: 'warning', title: 'Descriptive Naming', description: 'Variables, functions, and classes use descriptive names — no temp, data, doStuff.' },
  { category: 'code-quality', severity: 'suggestion', title: 'Single Responsibility', description: 'Each function/method does exactly one thing and is under 40 lines.' },
  { category: 'code-quality', severity: 'warning', title: 'No Dead Code', description: 'Unused imports, variables, functions, and commented-out code are removed.' },
  { category: 'code-quality', severity: 'suggestion', title: 'No Magic Numbers', description: 'Literal values are replaced with named constants.' },
  { category: 'code-quality', severity: 'warning', title: 'No Code Duplication', description: 'Repeated logic is extracted into shared functions (DRY principle).' },
  { category: 'code-quality', severity: 'suggestion', title: 'Shallow Nesting', description: 'Nesting depth is max 3-4 levels. Guard clauses used to reduce nesting.' },
  { category: 'code-quality', severity: 'info', title: 'Consistent Formatting', description: 'Code follows the project\'s established style guide (indentation, spacing).' },
  { category: 'code-quality', severity: 'suggestion', title: 'Meaningful Return Values', description: 'All code paths return the correct type and value.' },

  // Security
  { category: 'security', severity: 'critical', title: 'SQL Injection Prevention', description: 'Parameterized queries or prepared statements for all database access. No string concatenation.' },
  { category: 'security', severity: 'critical', title: 'XSS Prevention', description: 'All dynamic output is encoded using context-appropriate encoding (HTML, JS, URL, CSS).' },
  { category: 'security', severity: 'critical', title: 'Input Validation', description: 'Server-side validation using allowlists, type checks, length limits, and regex patterns.' },
  { category: 'security', severity: 'critical', title: 'Auth & Authorization', description: 'Server-side permission validation enforced on every protected endpoint.' },
  { category: 'security', severity: 'critical', title: 'Secret Management', description: 'API keys, passwords, tokens in env vars or vaults — never hardcoded.' },
  { category: 'security', severity: 'warning', title: 'Dependency Vulnerabilities', description: 'Third-party packages scanned for known CVEs. Package checksums verified.' },
  { category: 'security', severity: 'warning', title: 'CSRF Protection', description: 'Anti-CSRF tokens used for state-changing operations.' },
  { category: 'security', severity: 'warning', title: 'Error Message Leakage', description: 'Error responses avoid exposing database structure, stack traces, or internal paths.' },
  { category: 'security', severity: 'info', title: 'HTTPS Enforcement', description: 'All traffic forced to HTTPS. Secure cookie flags set (HttpOnly, Secure, SameSite).' },

  // Performance
  { category: 'performance', severity: 'warning', title: 'Algorithm Complexity', description: 'Time complexity reviewed. O(n²) avoidable with hash maps, sets, or sorting.' },
  { category: 'performance', severity: 'critical', title: 'N+1 Query Prevention', description: 'Database queries inside loops replaced with batch operations or JOINs.' },
  { category: 'performance', severity: 'warning', title: 'Memory Leak Prevention', description: 'File handles, connections, streams closed in all paths (success, error, finally).' },
  { category: 'performance', severity: 'suggestion', title: 'Caching Strategy', description: 'Expensive computations or repeated API calls cached with TTL and invalidation.' },
  { category: 'performance', severity: 'suggestion', title: 'Lazy Loading', description: 'Data loaded only when needed, avoiding unnecessary upfront fetching.' },
  { category: 'performance', severity: 'warning', title: 'Pagination', description: 'Large result sets paginated instead of loaded entirely into memory.' },
  { category: 'performance', severity: 'suggestion', title: 'Unbounded Collections', description: 'Caches, queues, and buffers have size limits and eviction policies.' },
  { category: 'performance', severity: 'info', title: 'Index Usage', description: 'Database queries use appropriate indexes. No full table scans on large tables.' },

  // Testing
  { category: 'testing', severity: 'warning', title: 'Unit Test Coverage', description: 'New code paths covered by unit tests: happy path, edge cases, and error cases.' },
  { category: 'testing', severity: 'suggestion', title: 'Test Independence', description: 'Tests run independently without relying on external services or shared state.' },
  { category: 'testing', severity: 'suggestion', title: 'Proper Mocking', description: 'External dependencies properly mocked or stubbed.' },
  { category: 'testing', severity: 'warning', title: 'Integration Tests', description: 'Cross-boundary changes (API, database) have integration tests present.' },
  { category: 'testing', severity: 'info', title: 'Test Readability', description: 'Tests follow Arrange-Act-Assert. Test names are descriptive.' },
  { category: 'testing', severity: 'suggestion', title: 'Regression Coverage', description: 'Test exists that catches this specific bug if reintroduced.' },

  // Documentation
  { category: 'documentation', severity: 'suggestion', title: 'Public API Docs', description: 'Public functions, classes, modules documented with purpose, params, returns, exceptions.' },
  { category: 'documentation', severity: 'info', title: 'Complex Logic Comments', description: 'Non-obvious algorithms or business rules explained with inline comments.' },
  { category: 'documentation', severity: 'suggestion', title: 'README/Changelog', description: 'User-facing or developer-facing changes reflected in documentation.' },
  { category: 'documentation', severity: 'info', title: 'Deprecation Notices', description: 'Deprecated APIs marked with warnings and migration instructions.' },

  // Architecture
  { category: 'architecture', severity: 'warning', title: 'SOLID Principles', description: 'Code follows Single Responsibility, Open/Closed, Liskov, Interface Segregation, DI.' },
  { category: 'architecture', severity: 'warning', title: 'Loose Coupling', description: 'Modules are loosely coupled and internally cohesive.' },
  { category: 'architecture', severity: 'suggestion', title: 'Dependency Direction', description: 'Dependencies point inward — domain does not depend on infrastructure.' },
  { category: 'architecture', severity: 'warning', title: 'Backward Compatibility', description: 'Change does not break existing consumers, APIs, or database schemas.' },
  { category: 'architecture', severity: 'info', title: 'Config Externalization', description: 'Environment-specific values externalized (no hardcoded URLs, ports, flags).' },

  // Error Handling
  { category: 'error-handling', severity: 'warning', title: 'Specific Exceptions', description: 'Specific exceptions caught rather than generic catch-all blocks.' },
  { category: 'error-handling', severity: 'warning', title: 'Graceful Degradation', description: 'System handles downstream failures without cascading crashes.' },
  { category: 'error-handling', severity: 'suggestion', title: 'Retry with Backoff', description: 'Retries implemented with exponential backoff and jitter for transient failures.' },
  { category: 'error-handling', severity: 'warning', title: 'Contextual Logging', description: 'Errors logged with sufficient context (request ID, user context, stack trace).' },
  { category: 'error-handling', severity: 'suggestion', title: 'User-Friendly Messages', description: 'Error messages helpful to users without exposing internals.' },

  // Accessibility
  { category: 'accessibility', severity: 'warning', title: 'Semantic HTML', description: 'Proper HTML elements used (button, nav, main, aside) instead of generic divs.' },
  { category: 'accessibility', severity: 'warning', title: 'ARIA Labels', description: 'Interactive elements have appropriate ARIA labels and roles.' },
  { category: 'accessibility', severity: 'suggestion', title: 'Keyboard Navigation', description: 'All interactive elements reachable and operable via keyboard.' },
  { category: 'accessibility', severity: 'warning', title: 'Color Contrast', description: 'Text meets WCAG AA contrast ratio (4.5:1 for normal, 3:1 for large text).' },
  { category: 'accessibility', severity: 'suggestion', title: 'Alt Text', description: 'Images have descriptive alt text. Decorative images have empty alt="".' },
  { category: 'accessibility', severity: 'info', title: 'Focus Indicators', description: 'Focus states are visible and distinct for all interactive elements.' },
];

// --- Preset Profiles ---

interface PresetProfile {
  name: string;
  description: string;
  categories: ReviewCategory[];
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const PRESETS: PresetProfile[] = [
  {
    name: 'Full Review',
    description: 'All categories enabled — comprehensive code review',
    categories: ['code-quality', 'security', 'performance', 'testing', 'documentation', 'architecture', 'error-handling', 'accessibility'],
    icon: Eye,
  },
  {
    name: 'Security Focus',
    description: 'Security, input validation, auth — for security-critical code',
    categories: ['security', 'error-handling', 'testing'],
    icon: Shield,
  },
  {
    name: 'Quick Quality',
    description: 'Code quality and performance — fast everyday reviews',
    categories: ['code-quality', 'performance', 'error-handling'],
    icon: Zap,
  },
  {
    name: 'Custom',
    description: 'Pick your own categories and checks',
    categories: [],
    icon: Settings2,
  },
];

// --- Wizard Steps ---

type WizardStep = 'welcome' | 'preset' | 'categories' | 'checks' | 'summary';

const STEPS: WizardStep[] = ['welcome', 'preset', 'categories', 'checks', 'summary'];

const STEP_LABELS: Record<WizardStep, string> = {
  welcome: 'Welcome',
  preset: 'Profile',
  categories: 'Categories',
  checks: 'Checks',
  summary: 'Complete',
};

// --- Severity helpers ---

function severityColor(s: ReviewSeverity): string {
  switch (s) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'suggestion': return '#3b82f6';
    case 'info': return '#6b7280';
  }
}

function severityLabel(s: ReviewSeverity): string {
  switch (s) {
    case 'critical': return 'Critical';
    case 'warning': return 'Warning';
    case 'suggestion': return 'Suggestion';
    case 'info': return 'Info';
  }
}

// ============================================================================
// Component
// ============================================================================

export function CodeReviewWizard() {
  const addReviewProfile = useMissionControl((s) => s.addReviewProfile);
  const setCodeReviewWizardCompleted = useMissionControl((s) => s.setCodeReviewWizardCompleted);
  const addNotification = useMissionControl((s) => s.addNotification);
  const addMemory = useMissionControl((s) => s.addMemory);
  const setActiveScreen = useMissionControl((s) => s.setActiveScreen);
  const codeReviewWizardCompleted = useMissionControl((s) => s.codeReviewWizardCompleted);
  const reviewProfiles = useMissionControl((s) => s.reviewProfiles);

  const [currentStep, setCurrentStep] = useState<WizardStep>(codeReviewWizardCompleted ? 'preset' : 'welcome');
  const [selectedPreset, setSelectedPreset] = useState<PresetProfile | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<ReviewCategory[]>([]);
  const [checks, setChecks] = useState<ReviewCheckItem[]>([]);
  const [profileName, setProfileName] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ReviewCategory | 'all'>('all');

  // --- Navigation ---
  const currentIndex = STEPS.indexOf(currentStep);

  const goNext = () => {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const goToStep = (step: WizardStep) => {
    const targetIndex = STEPS.indexOf(step);
    if (targetIndex <= currentIndex) {
      setCurrentStep(step);
    }
  };

  // --- Apply Preset ---
  const applyPreset = (preset: PresetProfile) => {
    setSelectedPreset(preset);
    if (preset.name !== 'Custom') {
      setSelectedCategories([...preset.categories]);
      setProfileName(preset.name);
      setProfileDesc(preset.description);
    } else {
      setSelectedCategories([]);
      setProfileName('');
      setProfileDesc('');
    }
  };

  // --- Toggle Category ---
  const toggleCategory = (catId: ReviewCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  // --- Build checks when entering checks step ---
  const buildChecks = () => {
    const newChecks: ReviewCheckItem[] = DEFAULT_CHECKS
      .filter((c) => selectedCategories.includes(c.category))
      .map((c) => ({
        ...c,
        id: generateId('chk'),
        enabled: true,
      }));
    setChecks(newChecks);
  };

  // --- Toggle check ---
  const toggleCheck = (id: string) => {
    setChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    );
  };

  // --- Toggle all checks in a category ---
  const toggleCategoryChecks = (catId: ReviewCategory) => {
    const catChecks = checks.filter((c) => c.category === catId);
    const allEnabled = catChecks.every((c) => c.enabled);
    setChecks((prev) =>
      prev.map((c) => (c.category === catId ? { ...c, enabled: !allEnabled } : c)),
    );
  };

  // --- Filtered checks for display ---
  const filteredChecks = useMemo(() => {
    return checks.filter((c) => {
      const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
      const matchesSearch =
        !searchTerm ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [checks, filterCategory, searchTerm]);

  // --- Stats ---
  const enabledCount = checks.filter((c) => c.enabled).length;
  const criticalCount = checks.filter((c) => c.enabled && c.severity === 'critical').length;

  // --- Complete Wizard ---
  const completeSetup = () => {
    addReviewProfile({
      name: profileName || 'My Review Profile',
      description: profileDesc || `${selectedCategories.length} categories, ${enabledCount} checks`,
      categories: selectedCategories,
      checks: checks.filter((c) => c.enabled),
    });

    addMemory({
      title: `Code Review Profile: ${profileName || 'My Review Profile'}`,
      content: `Created code review profile with ${selectedCategories.length} categories and ${enabledCount} active checks (${criticalCount} critical). Categories: ${selectedCategories.join(', ')}.`,
      category: 'decision',
      source: 'system',
      tags: ['code-review', 'quality', ...selectedCategories],
    });

    addNotification({
      title: 'Code Review Profile Created',
      message: `"${profileName || 'My Review Profile'}" is ready with ${enabledCount} checks.`,
      type: 'success',
    });

    setCodeReviewWizardCompleted(true);
    setActiveScreen('code-review');
  };

  // --- Render: Welcome ---
  const renderWelcome = () => (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-6">
        <ClipboardCheck className="w-16 h-16 mx-auto animate-float" style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">Code Review Wizard</h2>
      <p className="text-gray-400 mb-8 leading-relaxed">
        Set up your code review checklist to ensure consistent, high-quality reviews across your team.
        Choose from preset profiles or build a custom checklist with 60+ checks across 8 categories.
      </p>

      <div className="glass-panel p-6 text-left mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">What this wizard covers:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{cat.label}</p>
                  <p className="text-[10px] text-gray-500">{cat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-6 text-left">
        <h3 className="text-sm font-semibold text-white mb-3">Powered by Industry Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg" style={{ background: 'var(--glass-light)' }}>
            <p className="text-sm font-medium text-white mb-1">60+ Checks</p>
            <p className="text-xs text-gray-500">Comprehensive checklist covering OWASP, SOLID, WCAG, and more.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--glass-light)' }}>
            <p className="text-sm font-medium text-white mb-1">4 Severity Levels</p>
            <p className="text-xs text-gray-500">Critical, Warning, Suggestion, Info — prioritize what matters.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--glass-light)' }}>
            <p className="text-sm font-medium text-white mb-1">Custom Profiles</p>
            <p className="text-xs text-gray-500">Create multiple profiles for different review scenarios.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Render: Preset Selection ---
  const renderPreset = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">Choose a Review Profile</h2>
      <p className="text-sm text-gray-400 mb-6">
        Start with a preset or build your own custom checklist from scratch.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = selectedPreset?.name === preset.name;
          return (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={cn(
                'glass-panel p-5 text-left transition-all duration-300 group',
                isSelected ? 'ring-2' : 'hover:border-white/20',
              )}
              style={{
                borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                boxShadow: isSelected ? '0 0 20px var(--accent-glow)' : undefined,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: 'var(--glass-heavy)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{preset.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{preset.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {preset.categories.length > 0 ? (
                      preset.categories.slice(0, 3).map((catId) => {
                        const cat = CATEGORIES.find((c) => c.id === catId);
                        return (
                          <span
                            key={catId}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: `${cat?.color}15`, color: cat?.color }}
                          >
                            {cat?.label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--glass-heavy)', color: 'var(--accent-secondary)' }}>
                        You choose
                      </span>
                    )}
                    {preset.categories.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--glass-heavy)', color: 'var(--accent-primary)' }}>
                        +{preset.categories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Existing profiles */}
      {reviewProfiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Existing Profiles</h3>
          <div className="space-y-2">
            {reviewProfiles.map((profile) => (
              <div key={profile.id} className="glass-panel p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{profile.name}</p>
                  <p className="text-xs text-gray-500">
                    {profile.categories.length} categories, {profile.checks.length} checks
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // --- Render: Category Selection ---
  const renderCategories = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-2">Select Review Categories</h2>
      <p className="text-sm text-gray-400 mb-6">
        Choose which areas to include in your code review checklist.
        {selectedPreset && selectedPreset.name !== 'Custom' && (
          <span style={{ color: 'var(--accent-primary)' }}> Preset: {selectedPreset.name}</span>
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategories.includes(cat.id);
          const checkCount = DEFAULT_CHECKS.filter((c) => c.category === cat.id).length;
          const criticals = DEFAULT_CHECKS.filter((c) => c.category === cat.id && c.severity === 'critical').length;

          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                'glass-panel p-4 text-left transition-all duration-300',
                isSelected ? 'ring-2' : 'opacity-60 hover:opacity-100',
              )}
              style={{
                borderColor: isSelected ? cat.color : undefined,
                boxShadow: isSelected ? `0 0 15px ${cat.color}30` : undefined,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{cat.label}</h3>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        isSelected ? 'border-transparent' : 'border-gray-600',
                      )}
                      style={{
                        background: isSelected ? cat.color : 'transparent',
                      }}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--glass-heavy)', color: 'var(--accent-primary)' }}>
                      {checkCount} checks
                    </span>
                    {criticals > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                        {criticals} critical
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection summary */}
      <div className="mt-6 glass-panel p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-medium">
              {selectedCategories.length} / {CATEGORIES.length} categories selected
            </p>
            <p className="text-xs text-gray-500">
              {DEFAULT_CHECKS.filter((c) => selectedCategories.includes(c.category)).length} total checks will be available
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategories(CATEGORIES.map((c) => c.id))}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'var(--glass-light)', color: 'var(--accent-primary)' }}
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedCategories([])}
              className="text-xs px-3 py-1.5 rounded-lg text-gray-400 transition-all"
              style={{ background: 'var(--glass-light)' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Render: Check Items ---
  const renderChecks = () => {
    const groupedChecks: Record<string, ReviewCheckItem[]> = {};
    filteredChecks.forEach((c) => {
      if (!groupedChecks[c.category]) groupedChecks[c.category] = [];
      groupedChecks[c.category].push(c);
    });

    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-2">Configure Checks</h2>
        <p className="text-sm text-gray-400 mb-4">
          Toggle individual checks on or off. {enabledCount} of {checks.length} checks enabled.
        </p>

        {/* Search & Filter bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search checks..."
              className="input-glass pl-9"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ReviewCategory | 'all')}
            className="input-glass w-auto min-w-[140px]"
            style={{ background: 'var(--glass-light)', color: '#e2e8f0' }}
          >
            <option value="all">All Categories</option>
            {selectedCategories.map((catId) => {
              const cat = CATEGORIES.find((c) => c.id === catId);
              return (
                <option key={catId} value={catId}>
                  {cat?.label}
                </option>
              );
            })}
          </select>
        </div>

        {/* Profile name & description */}
        <div className="glass-panel p-4 mb-6 space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Profile Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g., Frontend Review, Backend Security..."
              className="input-glass"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <input
              type="text"
              value={profileDesc}
              onChange={(e) => setProfileDesc(e.target.value)}
              placeholder="Describe what this profile is for..."
              className="input-glass"
            />
          </div>
        </div>

        {/* Checks by category */}
        <div className="space-y-6">
          {Object.entries(groupedChecks).map(([catId, catChecks]) => {
            const cat = CATEGORIES.find((c) => c.id === catId);
            if (!cat) return null;
            const Icon = cat.icon;
            const allEnabled = catChecks.every((c) => c.enabled);
            const enabledInCat = catChecks.filter((c) => c.enabled).length;

            return (
              <div key={catId} className="glass-panel p-4">
                {/* Category header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${cat.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{cat.label}</h3>
                      <p className="text-[10px] text-gray-500">
                        {enabledInCat} / {catChecks.length} enabled
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCategoryChecks(catId as ReviewCategory)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'var(--glass-light)', color: allEnabled ? '#ef4444' : '#10b981' }}
                  >
                    {allEnabled ? (
                      <><ToggleRight className="w-3.5 h-3.5" /> Disable All</>
                    ) : (
                      <><ToggleLeft className="w-3.5 h-3.5" /> Enable All</>
                    )}
                  </button>
                </div>

                {/* Checks */}
                <div className="space-y-1">
                  {catChecks.map((check) => (
                    <button
                      key={check.id}
                      onClick={() => toggleCheck(check.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all',
                        check.enabled ? 'opacity-100' : 'opacity-40',
                      )}
                      style={{ background: check.enabled ? 'var(--glass-light)' : 'transparent' }}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all',
                          check.enabled ? '' : 'border border-gray-600',
                        )}
                        style={{ background: check.enabled ? 'var(--accent-primary)' : 'transparent' }}
                      >
                        {check.enabled && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{check.title}</span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: `${severityColor(check.severity)}15`, color: severityColor(check.severity) }}
                          >
                            {severityLabel(check.severity)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{check.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredChecks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No checks match your filter.</p>
          </div>
        )}
      </div>
    );
  };

  // --- Render: Summary ---
  const renderSummary = () => {
    const categorySummary = selectedCategories.map((catId) => {
      const cat = CATEGORIES.find((c) => c.id === catId)!;
      const catChecks = checks.filter((c) => c.category === catId);
      const enabled = catChecks.filter((c) => c.enabled).length;
      return { cat, total: catChecks.length, enabled };
    });

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-4">
          <Sparkles className="w-12 h-12 mx-auto" style={{ color: 'var(--accent-primary)' }} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Review Profile Ready!</h2>
        <p className="text-sm text-gray-400 mb-8">
          Your code review checklist is configured and ready to use.
        </p>

        {/* Summary Card */}
        <div className="glass-panel p-6 text-left mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Profile Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <span className="text-xs text-gray-500">Profile Name</span>
              <span className="text-sm text-white font-medium">{profileName || 'My Review Profile'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <span className="text-xs text-gray-500">Categories</span>
              <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                {selectedCategories.length} selected
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <span className="text-xs text-gray-500">Active Checks</span>
              <span className="text-sm font-medium text-white">{enabledCount} / {checks.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <span className="text-xs text-gray-500">Critical Checks</span>
              <span className="text-sm font-medium text-red-400">{criticalCount}</span>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="glass-panel p-6 text-left mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Category Breakdown</h3>
          <div className="space-y-2">
            {categorySummary.map(({ cat, total, enabled }) => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--glass-light)' }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.color }} />
                  <span className="text-xs text-gray-300 flex-1">{cat.label}</span>
                  <span className="text-xs font-medium" style={{ color: cat.color }}>
                    {enabled}/{total}
                  </span>
                  {/* Mini progress bar */}
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-heavy)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(enabled / total) * 100}%`, background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What's Next */}
        <div className="glass-panel p-6 text-left">
          <h3 className="text-sm font-semibold text-white mb-3">What&apos;s Next?</h3>
          <div className="space-y-2">
            {[
              { icon: ClipboardCheck, text: 'Use your checklist when reviewing code changes' },
              { icon: Settings2, text: 'Create additional profiles for different review types' },
              { icon: Eye, text: 'Track review completion from the Code Review dashboard' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--glass-light)' }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
                  <span className="text-xs text-gray-300">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- Main Step Router ---
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome': return renderWelcome();
      case 'preset': return renderPreset();
      case 'categories': return renderCategories();
      case 'checks': return renderChecks();
      case 'summary': return renderSummary();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome': return true;
      case 'preset': return selectedPreset !== null;
      case 'categories': return selectedCategories.length > 0;
      case 'checks': return enabledCount > 0;
      case 'summary': return true;
    }
  };

  const handleNext = () => {
    if (currentStep === 'categories') {
      buildChecks();
    }
    goNext();
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, i) => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              className={cn(
                'flex items-center gap-2 transition-all',
                i <= currentIndex ? 'opacity-100' : 'opacity-40',
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  i < currentIndex && 'text-black',
                  i === currentIndex && 'text-black animate-pulse-slow',
                  i > currentIndex && 'text-gray-500',
                )}
                style={{
                  background: i <= currentIndex ? 'var(--accent-primary)' : 'var(--glass-heavy)',
                  boxShadow: i === currentIndex ? '0 0 15px var(--accent-glow)' : undefined,
                }}
              >
                {i < currentIndex ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden md:inline',
                  i === currentIndex ? 'text-white' : 'text-gray-500',
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </button>
          ))}
        </div>
        {/* Progress line */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--glass-heavy)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
              background: 'var(--accent-primary)',
              boxShadow: '0 0 10px var(--accent-glow)',
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--glass-border)' }}>
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className={cn('btn-ghost', currentIndex === 0 && 'opacity-30 cursor-not-allowed')}
        >
          Back
        </button>

        <div className="flex gap-3">
          {currentStep === 'summary' ? (
            <button
              onClick={completeSetup}
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all text-black"
              style={{
                background: 'var(--accent-primary)',
                boxShadow: '0 0 20px var(--accent-glow)',
              }}
            >
              Create Profile
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn('btn-primary', !canProceed() && 'opacity-30 cursor-not-allowed')}
            >
              Next
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
