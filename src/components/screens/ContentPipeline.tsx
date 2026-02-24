'use client';

import { useState } from 'react';
import { useMissionControl } from '@/lib/store';
import type { ContentItem, ContentStage } from '@/lib/types';
import { cn, timeAgo, toLabel } from '@/lib/utils';

const stages: { id: ContentStage; label: string; color: string; icon: string }[] = [
  { id: 'ideas', label: 'Ideas', color: '#c084fc', icon: '💡' },
  { id: 'research', label: 'Research', color: '#60a5fa', icon: '🔍' },
  { id: 'outline', label: 'Outline', color: '#34d399', icon: '📝' },
  { id: 'script', label: 'Script', color: '#fbbf24', icon: '📄' },
  { id: 'assets', label: 'Assets', color: '#f472b6', icon: '🎨' },
  { id: 'editing', label: 'Editing', color: '#fb923c', icon: '✂️' },
  { id: 'scheduled', label: 'Scheduled', color: '#2dd4bf', icon: '📅' },
  { id: 'published', label: 'Published', color: '#a3e635', icon: '🚀' },
];

export function ContentPipeline() {
  const contentItems = useMissionControl((s) => s.contentItems);
  const addContentItem = useMissionControl((s) => s.addContentItem);
  const moveContentItem = useMissionControl((s) => s.moveContentItem);
  const deleteContentItem = useMissionControl((s) => s.deleteContentItem);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStage, setNewStage] = useState<ContentStage>('ideas');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addContentItem({
      title: newTitle,
      description: newDesc,
      stage: newStage,
      content: '',
      attachments: [],
      assignedTo: 'ai',
      tags: [],
    });
    setNewTitle('');
    setNewDesc('');
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-gray-500">
          {contentItems.length} items in pipeline · {contentItems.filter(c => c.stage === 'published').length} published
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + New Content
        </button>
      </div>

      {/* New Content Form */}
      {showForm && (
        <div className="glass-panel p-5 mb-6 animate-slide-in">
          <h3 className="text-sm font-semibold text-white mb-4">Add to Pipeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Content title..."
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Stage</label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value as ContentStage)}
                className="input-glass"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe the content..."
                className="input-glass min-h-[80px] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-primary">Add to Pipeline</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Pipeline Stages */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 250px)' }}>
        {stages.map((stage) => {
          const items = contentItems.filter((c) => c.stage === stage.id);
          return (
            <div key={stage.id} className="min-w-[240px] max-w-[260px] flex-shrink-0">
              {/* Stage Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span>{stage.icon}</span>
                <span className="text-xs font-semibold text-white">{stage.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${stage.color}15`, color: stage.color }}>
                  {items.length}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel-hover p-3 group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-xs font-medium text-white">{item.title}</h4>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteContentItem(item.id); }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-500 hover:text-red-400 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                    {item.description && (
                      <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-600">{item.assignedTo}</span>
                      <span className="text-[10px] text-gray-600">{timeAgo(item.updatedAt)}</span>
                    </div>

                    {/* Stage Move Buttons */}
                    <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {stages.map((s) => {
                        if (s.id === item.stage) return null;
                        return (
                          <button
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); moveContentItem(item.id, s.id); }}
                            className="text-[9px] px-1.5 py-0.5 rounded transition-colors"
                            style={{ background: `${s.color}10`, color: s.color }}
                          >
                            {s.icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="glass-panel p-4 text-center border-dashed" style={{ borderColor: `${stage.color}20` }}>
                    <p className="text-[10px] text-gray-600">Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="glass-panel-solid p-6 max-w-lg w-full animate-slide-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedItem.title}</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{selectedItem.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Stage: <span style={{ color: stages.find(s => s.id === selectedItem.stage)?.color }}>{toLabel(selectedItem.stage)}</span></span>
              <span>Assigned: {selectedItem.assignedTo}</span>
            </div>
            {selectedItem.versions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Version History</h4>
                <div className="space-y-1">
                  {selectedItem.versions.map((v) => (
                    <div key={v.id} className="text-[10px] text-gray-500">
                      v{v.id.slice(-4)} by {v.author} — {timeAgo(v.createdAt)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <button onClick={() => setSelectedItem(null)} className="btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
