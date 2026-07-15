import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { BlueprintStorage } from '@/storage/BlueprintStorage';
import { useToast } from '@/contexts/ToastContext';
import { BLUEPRINT_CATEGORIES } from '@/constants/blueprints';
import type { BlueprintCategory } from '@/types';

interface SaveBlueprintDialogProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export function SaveBlueprintDialog({ projectId, projectName, onClose }: SaveBlueprintDialogProps) {
  const { success, error } = useToast();
  const [name, setName] = useState(`${projectName} Blueprint`);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BlueprintCategory>('Custom');
  const [audience, setAudience] = useState('');
  const [setupTime, setSetupTime] = useState('~5 min');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      BlueprintStorage.saveFromProject(projectId, { name, description, category, audience, setupTime });
      success('Blueprint saved!', `"${name}" is now available in the Blueprint Store.`);
      onClose();
    } catch (e) {
      error('Failed to save blueprint', 'Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-surface-border w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            <h2 className="text-base font-semibold text-content-primary">Save as Blueprint</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="label">Blueprint Name</label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Awesome Blueprint"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="textarea"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What type of project is this a template for?"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value as BlueprintCategory)}>
                {BLUEPRINT_CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Setup Time</label>
              <input
                className="input"
                value={setupTime}
                onChange={e => setSetupTime(e.target.value)}
                placeholder="~5 min"
              />
            </div>
          </div>

          <div>
            <label className="label">Target Audience</label>
            <input
              className="input"
              value={audience}
              onChange={e => setAudience(e.target.value)}
              placeholder="e.g. Solo developers, small teams"
            />
          </div>

          <p className="text-xs text-content-muted bg-surface-secondary rounded-xl p-3 border border-surface-border">
            This will capture your project's current tasks, sprints, documents, and snippets as a reusable template.
          </p>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-surface-border">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Blueprint'}
          </button>
        </div>
      </div>
    </div>
  );
}
