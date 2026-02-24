'use client';

import { useState, useMemo } from 'react';
import { useMissionControl } from '@/lib/store';
import type { Memory, MemoryCategory } from '@/lib/types';
import { cn, timeAgo, toLabel } from '@/lib/utils';

const categories: { id: MemoryCategory; label: string; color: string; icon: string }[] = [
  { id: 'preference', label: 'Preferences', color: '#f472b6', icon: '⚙️' },
  { id: 'context', label: 'Context', color: '#60a5fa', icon: '📋' },
  { id: 'learned', label: 'Learned', color: '#34d399', icon: '🧠' },
  { id: 'project', label: 'Project', color: '#fbbf24', icon: '📁' },
  { id: 'decision', label: 'Decisions', color: '#a78bfa', icon: '⚖️' },
  { id: 'conversation', label: 'Conversations', color: '#fb923c', icon: '💬' },
];

export function MemoryScreen() {
  const memories = useMissionControl((s) => s.memories);
  const addMemory = useMissionControl((s) => s.addMemory);
  const updateMemory = useMissionControl((s) => s.updateMemory);
  const deleteMemory = useMissionControl((s) => s.deleteMemory);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<MemoryCategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('context');
  const [newSource, setNewSource] = useState('');
  const [newTags, setNewTags] = useState('');

  const filteredMemories = useMemo(() => {
    return memories
      .filter((m) => {
        if (filterCategory !== 'all' && m.category !== filterCategory) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            m.title.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q) ||
            m.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [memories, filterCategory, search]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addMemory({
      title: newTitle,
      content: newContent,
      category: newCategory,
      source: newSource || 'user',
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    resetForm();
  };

  const handleEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setNewTitle(memory.title);
    setNewContent(memory.content);
    setNewCategory(memory.category);
    setNewSource(memory.source);
    setNewTags(memory.tags.join(', '));
    setShowForm(true);
  };

  const handleUpdate = () => {
    if (!editingId || !newTitle.trim()) return;
    updateMemory(editingId, {
      title: newTitle,
      content: newContent,
      category: newCategory,
      source: newSource,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewSource('');
    setNewTags('');
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-gray-500">{memories.length} memories stored</p>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">
          + New Memory
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="input-glass pl-8"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">⌕</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn('text-xs px-3 py-2 rounded-lg transition-colors', filterCategory === 'all' ? 'text-white' : 'text-gray-500')}
            style={{ background: filterCategory === 'all' ? 'var(--glass-heavy)' : 'var(--glass-light)', border: '1px solid var(--glass-border)' }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn('text-xs px-3 py-2 rounded-lg transition-colors')}
              style={{
                background: filterCategory === cat.id ? `${cat.color}15` : 'var(--glass-light)',
                color: filterCategory === cat.id ? cat.color : '#6b7280',
                border: `1px solid ${filterCategory === cat.id ? `${cat.color}40` : 'var(--glass-border)'}`,
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* New/Edit Memory Form */}
      {showForm && (
        <div className="glass-panel p-5 mb-6 animate-slide-in">
          <h3 className="text-sm font-semibold text-white mb-4">
            {editingId ? 'Edit Memory' : 'Store New Memory'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Memory title..." className="input-glass" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as MemoryCategory)} className="input-glass">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Source</label>
                <input type="text" value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="user / ai / system" className="input-glass" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Content</label>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="What should be remembered..." className="input-glass min-h-[100px] resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Tags (comma-separated)</label>
              <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="tag1, tag2, tag3" className="input-glass" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={editingId ? handleUpdate : handleAdd} className="btn-primary">
              {editingId ? 'Update Memory' : 'Store Memory'}
            </button>
            <button onClick={resetForm} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Memory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories.map((memory) => {
          const cat = categories.find((c) => c.id === memory.category);
          return (
            <div key={memory.id} className="glass-panel-hover p-4 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${cat?.color}15`, color: cat?.color }}>
                  {cat?.icon} {cat?.label}
                </span>
                <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 flex gap-1 transition-all">
                  <button onClick={() => handleEdit(memory)} className="text-[10px] text-gray-500 hover:text-blue-400 p-1">Edit</button>
                  <button onClick={() => deleteMemory(memory.id)} className="text-[10px] text-gray-500 hover:text-red-400 p-1">Delete</button>
                </div>
              </div>

              <h4 className="text-sm font-medium text-white mb-1">{memory.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-3 mb-3">{memory.content}</p>

              {/* Tags */}
              {memory.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-2">
                  {memory.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--glass-medium)', color: 'var(--accent-primary)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-600">Source: {memory.source}</span>
                <span className="text-[10px] text-gray-600">{timeAgo(memory.updatedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMemories.length === 0 && (
        <div className="glass-panel p-12 text-center">
          <p className="text-sm text-gray-500">No memories found</p>
          <p className="text-xs text-gray-600 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
