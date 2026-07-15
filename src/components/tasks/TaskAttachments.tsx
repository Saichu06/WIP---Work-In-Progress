import React, { useState, useRef } from 'react';
import { TaskAttachment } from '@/types';
import { Upload, Trash2, Download, Image, FileText, File, ExternalLink } from 'lucide-react';
import { TaskStorage } from '@/storage/TaskStorage';
import { formatFileSize, formatRelative, getAssetType } from '@/utils';

interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  onUpdate: () => void;
}

export function TaskAttachments({ taskId, attachments, onUpdate }: TaskAttachmentsProps) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        TaskStorage.addAttachment(
          taskId,
          file.name,
          getAssetType(file.type),
          file.size,
          dataUrl
        );
        onUpdate();
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = (attachmentId: string) => {
    TaskStorage.deleteAttachment(taskId, attachmentId);
    onUpdate();
  };

  const handleDownload = (attachment: TaskAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.name;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-brand-yellow bg-brand-yellow/10'
            : 'border-surface-border hover:border-gray-300 hover:bg-surface-secondary/50'
        }`}
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={20} className={`mx-auto mb-2 ${dragging ? 'text-brand-yellow-dark' : 'text-content-muted'}`} />
        <p className="text-xs font-semibold text-content-secondary">
          Drag files here or click to browse
        </p>
        <p className="text-[10px] text-content-muted mt-0.5">Images, PDFs, ZIPs or Doc files (Base64 MVP)</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Attachments List */}
      <div className="grid grid-cols-1 gap-2">
        {attachments.map(file => {
          const isImage = file.type === 'image';
          return (
            <div
              key={file.id}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-surface-border bg-white hover:shadow-sm transition-all group"
            >
              {/* Preview Thumbnail */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-secondary flex-shrink-0 overflow-hidden border border-surface-border">
                {isImage ? (
                  <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                ) : file.type === 'pdf' ? (
                  <FileText size={18} className="text-red-500" />
                ) : (
                  <File size={18} className="text-gray-500" />
                )}
              </div>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-content-primary truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[10px] text-content-muted mt-0.5">
                  {formatFileSize(file.size)} · {formatRelative(file.createdAt)}
                </p>
              </div>

              {/* Quick operations */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isImage && (
                  <a
                    href={file.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost p-1.5 h-7 w-7 text-content-muted hover:text-content-primary rounded-md flex items-center justify-center"
                    title="View Full Image"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={() => handleDownload(file)}
                  className="btn-ghost p-1.5 h-7 w-7 text-content-muted hover:text-content-primary rounded-md"
                  title="Download File"
                >
                  <Download size={12} />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="btn-ghost p-1.5 h-7 w-7 text-content-muted hover:text-red-500 rounded-md"
                  title="Delete File"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}

        {attachments.length === 0 && (
          <p className="text-xs text-content-muted italic text-center py-4">No attachments uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
