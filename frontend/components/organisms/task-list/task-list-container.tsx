"use client";

import { CreateTaskFormValues } from "@/lib/schema/zod/tasks/create-task";
import { TaskCardProps, OverviewTaskSkeleton } from "@/components/organisms";
import { Id } from "@/convex/_generated/dataModel";

import { useTaskList } from "@/hooks";
import { PERMISSIONS, TASK_STATUS, TaskStatus, cn } from "@/lib";

import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult
} from "@hello-pangea/dnd";

import { TaskListGroup } from "./task-list-group";
import { TaskListItem } from "./task-list-item";
import { TaskListQuickAdd } from "./task-list-quick-add";

interface TaskListContainerProps {
  projectId: Id<"projects">;
  tasks: TaskCardProps[];
  isLoading?: boolean;
  onStatusChange?: (taskId: Id<"tasks">, newStatus: TaskStatus, newIndex: number) => void;
  onEdit?: (task: TaskCardProps) => void;
  onDelete?: (task: TaskCardProps) => void;
  onArchive?: (task: TaskCardProps) => void;
  onUnarchive?: (task: TaskCardProps) => void;
  onAddTask?: (status: TaskStatus) => void;
  onQuickAdd?: (title: string, status: TaskStatus) => void;
  onTaskClick?: (id: Id<"tasks">) => void;
  onBulkDelete?: (taskIds: Id<"tasks">[]) => void;
  onBulkArchive?: (taskIds: Id<"tasks">[]) => void;
  onBulkUnarchive?: (taskIds: Id<"tasks">[]) => void;
  onBulkMove?: (taskIds: Id<"tasks">[], newStatus: TaskStatus) => void;
  onUpdate?: (id: Id<"tasks">, updates: Partial<CreateTaskFormValues>) => void;
  selectedIds?: Set<Id<"tasks">>;
  onSelect?: (id: Id<"tasks">, checked: boolean) => void;
  onSelectAll?: (status: TaskStatus, checked: boolean) => void;
  className?: string;
}

export const TaskListContainer = ({
  projectId,
  tasks,
  isLoading,
  onStatusChange,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onAddTask,
  onQuickAdd,
  onTaskClick,
  onBulkDelete,
  onBulkArchive,
  onBulkUnarchive,
  onBulkMove,
  onUpdate,
  selectedIds = new Set(),
  onSelect,
  onSelectAll,
  className
}: TaskListContainerProps) => {
  const { groupedTasks, canCreate, can } = useTaskList(projectId, tasks);
  const canDelete = can(PERMISSIONS.TASK_DELETE);
  const canArchive = can(PERMISSIONS.TASK_ARCHIVE);


  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onStatusChange?.(
      draggableId as Id<"tasks">, 
      destination.droppableId as TaskStatus,
      destination.index
    );
  };

  if (isLoading) {
    return (
      <OverviewTaskSkeleton className={className} itemCount={10}/>
    );
  }

  return (
    <div className={cn("flex flex-col h-full w-full space-y-4", className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-10">
          {Object.entries(TASK_STATUS).map(([key, status]) => {
            const currentTasks = groupedTasks[status as TaskStatus];
            const isDone = status === TASK_STATUS.DONE;
            const selectedTasks = currentTasks.filter(t => selectedIds.has(t._id));
            const nonArchivedSelectedCount = selectedTasks.filter(t => !t.isArchived).length;
            const archivedSelectedCount = selectedTasks.filter(t => t.isArchived).length;

            return (
              <TaskListGroup
                key={status}
                status={status as TaskStatus}
                title={status.replace("_", " ")}
                count={currentTasks.length}
                defaultCollapsed={isDone && currentTasks.length > 5}
                canDelete={canDelete}
                canArchive={canArchive}
                onAddTask={onAddTask}
                onSelectAll={onSelectAll}
                isAllSelected={currentTasks.length > 0 && currentTasks.every(t => selectedIds.has(t._id))}
                selectedCount={selectedTasks.length}
                nonArchivedSelectedCount={nonArchivedSelectedCount}
                archivedSelectedCount={archivedSelectedCount}
                onBulkDelete={() => {
                  const ids = selectedTasks.map(t => t._id);
                  onBulkDelete?.(ids);
                }}
                onBulkArchive={() => {
                  const ids = selectedTasks.filter(t => !t.isArchived).map(t => t._id);
                  onBulkArchive?.(ids);
                }}
                onBulkUnarchive={() => {
                  const ids = selectedTasks.filter(t => t.isArchived).map(t => t._id);
                  onBulkUnarchive?.(ids);
                }}
                onBulkMove={(oldStatus, newStatus) => {
                  const ids = selectedTasks.map(t => t._id);
                  onBulkMove?.(ids, newStatus);
                }}
              >
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-2.5"
                    >
                      {currentTasks.map((task, index) => (
                        <Draggable 
                          key={task._id} 
                          draggableId={task._id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                snapshot.isDragging && "z-50 shadow-2xl ring-2 ring-primary/20 rounded-xl bg-card"
                              )}
                            >
                              <TaskListItem
                                id={task._id}
                                title={task.title}
                                status={task.status}
                                type={task.type}
                                priority={task.priority}
                                dueDate={task.dueDate}
                                description={task.description}
                                assignee={{
                                  name: task.assigneeDetails?.[0]?.fullName,
                                  imageUrl: task.assigneeDetails?.[0]?.imageUrl
                                }}
                                onToggleStatus={(id, status) => {
                                  const nextStatus = status === TASK_STATUS.DONE ? TASK_STATUS.TODO : TASK_STATUS.DONE;
                                  onStatusChange?.(id, nextStatus, 0);
                                }}
                                onClick={onTaskClick}
                                onEdit={() => onEdit?.(task)}
                                onDelete={() => onDelete?.(task)}
                                onArchive={() => onArchive?.(task)}
                                onUnarchive={() => onUnarchive?.(task)}
                                isArchived={task.isArchived}
                                isSelected={selectedIds.has(task._id)}
                                onSelect={onSelect}
                                onUpdate={onUpdate}
                                can={can}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                
                {canCreate && (
                  <div className="mt-4">
                    <TaskListQuickAdd 
                      onAdd={(title) => onQuickAdd?.(title, status as TaskStatus)}
                      variant={currentTasks.length === 0 ? "placeholder" : "minimal"}
                      placeholder={currentTasks.length === 0 ? "No tasks yet" : `Add task to ${status.replace("_", " ")}...`}
                    />
                  </div>
                )}
              </TaskListGroup>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};


