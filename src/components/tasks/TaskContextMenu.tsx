import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, FolderOpen, Edit3, Copy, Archive, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/utils';

interface TaskContextMenuProps {
  isArchived?: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore?: () => void;
  onDelete: () => void;
}

export function TaskContextMenu({ isArchived, onOpen, onEdit, onDuplicate, onArchive, onRestore, onDelete }: TaskContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="btn-ghost p-1 h-7 w-7 text-content-muted hover:text-content-primary rounded-md flex items-center justify-center"
      >
        <MoreVertical size={13} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-surface-border rounded-xl shadow-lg z-20 py-1 animate-scale-in">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onOpen();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-content-primary hover:bg-surface-secondary text-left font-medium"
          >
            <FolderOpen size={12} /> Open Details
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEdit();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-content-primary hover:bg-surface-secondary text-left font-medium"
          >
            <Edit3 size={12} /> Quick Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDuplicate();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-content-primary hover:bg-surface-secondary text-left font-medium"
          >
            <Copy size={12} /> Duplicate
          </button>

          {isArchived ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onRestore?.();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 text-left font-medium"
            >
              <RotateCcw size={12} /> Restore Task
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onArchive();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-content-secondary hover:bg-surface-secondary text-left font-medium"
            >
              <Archive size={12} /> Archive Task
            </button>
          )}

          <div className="h-px bg-surface-border my-1" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
          >
            <Trash2 size={12} /> Delete Permanently
          </button>
        </div>
      )}
    </div>
  );
}
