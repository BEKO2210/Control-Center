'use client';

import { useEffect, useState } from 'react';
import { useMissionControl } from '@/lib/store';
import { aiBridge, checkAiAvailability } from '@/lib/services/aiBridge';
import type { Task, TaskStatus, TaskPriority } from '@/lib/types';
import { cn, toLabel, timeAgo, getPriorityColor } from '@/lib/utils';
import { X, Sparkles } from 'lucide-react';

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'idea', label: 'Ideas', color: '#c084fc' },
  { id: 'queued', label: 'Queued', color: '#60a5fa' },
  { id: 'in_progress', label: 'In Progress', color: '#fbbf24' },
  { id: 'review', label: 'Review', color: '#fb923c' },
  { id: 'done', label: 'Done', color: '#34d399' },
];

export function TaskBoard() {
  const tasks = useMissionControl((s) => s.tasks);
  const addTask = useMissionControl((s) => s.addTask);
  const moveTask = useMissionControl((s) => s.moveTask);
  const deleteTask = useMissionControl((s) => s.deleteTask);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newStatus, setNewStatus] = useState<TaskStatus>('idea');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  // AIBridge availability is session-scoped (sessionStorage), so it lives in
  // local state rather than the persisted store (DEFEKT-4).
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiBusyId, setAiBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    checkAiAvailability().then((ready) => {
      if (active) setAiEnabled(ready);
    });
    return () => {
      active = false;
    };
  }, []);

  const runWithAi = async (task: Task) => {
    if (aiBusyId) return;
    setAiBusyId(task.id);
    try {
      await aiBridge.processTask(task);
    } finally {
      setAiBusyId(null);
    }
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle,
      description: newDesc,
      status: newStatus,
      assignedTo: 'user',
      priority: newPriority,
      relatedFiles: [],
      tags: [],
    });
    setNewTitle('');
    setNewDesc('');
    setShowNewTask(false);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask) {
      moveTask(draggedTask, status);
      setDraggedTask(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500">{tasks.length} tasks · {tasks.filter(t => t.status === 'done').length} completed</p>
        </div>
        <button onClick={() => setShowNewTask(!showNewTask)} className="btn-primary">
          + New Task
        </button>
      </div>

      {/* New Task Form */}
      {showNewTask && (
        <div className="glass-panel p-5 mb-6 animate-slide-in">
          <h3 className="text-sm font-semibold text-white mb-4">Create New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title..."
                className="input-glass"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="input-glass"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Column</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                  className="input-glass"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>{col.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What needs to be done..."
                className="input-glass min-h-[80px] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAddTask} className="btn-primary">Create Task</button>
            <button onClick={() => setShowNewTask(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 250px)' }}>
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <div
              key={column.id}
              className="kanban-column flex-shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: column.color }} />
                  <span className="text-sm font-semibold text-white">{column.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--glass-medium)', color: column.color }}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className="space-y-2 flex-1">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={cn(
                      'kanban-card group',
                      draggedTask === task.id && 'opacity-50',
                    )}
                  >
                    {/* Priority Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn('badge border', getPriorityColor(task.priority))}>
                        {toLabel(task.priority)}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-xs text-gray-500 hover:text-red-400 transition-all p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-white mb-1">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-600">{task.assignedTo}</span>
                      <span className="text-[10px] text-gray-600">{timeAgo(task.updatedAt)}</span>
                    </div>

                    {/* Run with AI (DEFEKT-4) — only when a Claude key is set */}
                    {aiEnabled && (task.status === 'idea' || task.status === 'queued') && (
                      <button
                        onClick={() => runWithAi(task)}
                        disabled={aiBusyId === task.id}
                        className={cn(
                          'mt-3 w-full text-[10px] px-2 py-1.5 rounded flex items-center justify-center gap-1.5 transition-all',
                          aiBusyId === task.id && 'opacity-60 cursor-not-allowed',
                        )}
                        style={{
                          background: 'rgba(139,92,246,0.12)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139,92,246,0.3)',
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        {aiBusyId === task.id ? 'Dispatching to Claude…' : 'Run with AI'}
                      </button>
                    )}

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {task.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--glass-medium)', color: 'var(--accent-primary)' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Move Buttons */}
                    <div className="flex gap-1 mt-3 flex-wrap opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {columns.map((col) => {
                        if (col.id === task.status) return null;
                        return (
                          <button
                            key={col.id}
                            onClick={() => moveTask(task.id, col.id)}
                            className="text-[10px] px-2 py-1 rounded transition-colors"
                            style={{ background: 'var(--glass-light)', color: col.color, border: `1px solid ${col.color}30` }}
                          >
                            {col.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div
                    className="glass-panel p-6 text-center border-dashed"
                    style={{ borderColor: `${column.color}30` }}
                  >
                    <p className="text-xs text-gray-600">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
