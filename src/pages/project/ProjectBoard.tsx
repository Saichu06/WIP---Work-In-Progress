import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal } from 'lucide-react';
import { TaskStorage } from '@/storage/TaskStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { KANBAN_COLUMNS } from '@/constants';
import { cn } from '@/utils';
import type { Project, Task, TaskStatus } from '@/types';

export function ProjectBoard() {
  const { project } = useOutletContext<{ project: Project }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addingTo, setAddingTo] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    setTasks(TaskStorage.getByProject(project.id));
  }, [project.id]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    TaskStorage.update(draggableId, { status: newStatus });

    if (newStatus === 'done') {
      ActivityStorage.log('task_completed', 'Task completed', `Task moved to Done`, project.id, draggableId);
    } else {
      ActivityStorage.log('task_moved', 'Task moved', `Task moved to ${newStatus}`, project.id, draggableId);
    }

    setTasks(TaskStorage.getByProject(project.id));
  };

  const quickAddTask = (status: TaskStatus) => {
    if (!newTaskTitle.trim()) { setAddingTo(null); return; }
    TaskStorage.create({
      projectId: project.id,
      title: newTaskTitle,
      description: '',
      status,
      priority: 'medium',
      labels: [],
      storyPoints: 1,
      acceptanceCriteria: '',
      assignee: '',
      isFavorite: false,
    });
    ActivityStorage.log('task_created', 'Task created', `"${newTaskTitle}" added to board`, project.id);
    setTasks(TaskStorage.getByProject(project.id));
    setNewTaskTitle('');
    setAddingTo(null);
  };

  const getColumnTasks = (status: TaskStatus) => tasks.filter(t => t.status === status);

  return (
    <div className="h-full overflow-x-auto">
      <div className="p-6 min-w-max">
        <div className="flex items-center justify-between mb-6 pr-4">
          <div>
            <h1 className="page-title">Board</h1>
            <p className="page-subtitle">{tasks.length} tasks across {KANBAN_COLUMNS.length} columns</p>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4">
            {KANBAN_COLUMNS.map(col => {
              const colTasks = getColumnTasks(col.id as TaskStatus);
              return (
                <div key={col.id} className="flex flex-col w-72 min-w-[288px]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-xs font-semibold text-content-primary uppercase tracking-wide">{col.title}</span>
                      <span className="text-xs text-content-muted bg-surface-secondary px-1.5 py-0.5 rounded-md">{colTasks.length}</span>
                    </div>
                    <button
                      onClick={() => { setAddingTo(col.id as TaskStatus); setNewTaskTitle(''); }}
                      className="btn-ghost p-1 text-content-muted hover:text-content-primary"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'flex-1 rounded-xl p-2 min-h-[400px] transition-colors duration-150',
                          snapshot.isDraggingOver ? 'bg-brand-yellow/10 border-2 border-dashed border-brand-yellow-dark' : 'bg-surface-secondary'
                        )}
                      >
                        {/* Quick Add Input */}
                        {addingTo === col.id && (
                          <div className="mb-2">
                            <input
                              className="input text-sm h-9 mb-1"
                              placeholder="Task name..."
                              value={newTaskTitle}
                              onChange={e => setNewTaskTitle(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') quickAddTask(col.id as TaskStatus);
                                if (e.key === 'Escape') setAddingTo(null);
                              }}
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <button onClick={() => quickAddTask(col.id as TaskStatus)} className="btn-primary text-xs h-7 px-3">Add</button>
                              <button onClick={() => setAddingTo(null)} className="btn-ghost text-xs h-7 px-3">Cancel</button>
                            </div>
                          </div>
                        )}

                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  'bg-white rounded-xl p-3.5 mb-2 border border-surface-border transition-shadow cursor-grab active:cursor-grabbing',
                                  snapshot.isDragging ? 'shadow-lg rotate-1 border-brand-yellow' : 'hover:shadow-md'
                                )}
                              >
                                {/* Labels */}
                                {task.labels.length > 0 && (
                                  <div className="flex gap-1 mb-2 flex-wrap">
                                    {task.labels.slice(0, 2).map(l => (
                                      <span key={l} className="text-xs px-1.5 py-0.5 rounded-md bg-surface-secondary text-content-muted">{l}</span>
                                    ))}
                                  </div>
                                )}
                                <p className="text-sm font-medium text-content-primary leading-tight mb-2.5">{task.title}</p>
                                <div className="flex items-center justify-between">
                                  <PriorityBadge priority={task.priority} />
                                  <div className="flex items-center gap-2 text-xs text-content-muted">
                                    {task.assignee && <span className="w-5 h-5 rounded-full bg-brand-yellow text-content-primary flex items-center justify-center text-xs font-bold">{task.assignee[0].toUpperCase()}</span>}
                                    <span className="bg-surface-secondary px-1.5 py-0.5 rounded-md">{task.storyPoints}pt</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}

                        {colTasks.length === 0 && !snapshot.isDraggingOver && addingTo !== col.id && (
                          <div className="flex flex-col items-center justify-center h-24 text-xs text-content-muted">
                            <p>Drop cards here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
