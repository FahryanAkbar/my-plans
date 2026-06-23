"use client";

import React from "react";
import { Link2, Check, Target, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  Button, 
  Popover, 
  PopoverContent, 
  PopoverTrigger,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Typography
} from "@/components/atoms";
import { cn } from "@/lib";

interface TaskSelectorProps {
  projectId: Id<"projects">;
  selectedTaskId?: Id<"tasks"> | null;
  onSelect: (taskId: Id<"tasks"> | null) => void;
}

export const TaskSelector = ({ projectId, selectedTaskId, onSelect }: TaskSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const tasks = useQuery(api.task.getByProject, { projectId });
  const selectedTask = tasks?.find(t => t._id === selectedTaskId);

  const handleSelect = (taskId: Id<"tasks"> | null) => {
    onSelect(taskId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-2 hover:bg-muted/50 rounded-lg px-3 group"
        >
          <Link2 className={cn(
            "h-3.5 w-3.5 transition-colors",
            selectedTaskId ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary"
          )} />
          {selectedTask ? (
            <Typography className="text-sm font-medium text-foreground truncate max-w-50">
              {selectedTask.title}
            </Typography>
          ) : (
            <Typography className="text-sm text-muted-foreground/60 italic">Link a task...</Typography>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80 rounded-2xl shadow-2xl border-border/50 bg-card/95 backdrop-blur-xl" align="start">
        <Command className="bg-transparent">
          <div className="p-2 border-b border-border/10">
            <CommandInput 
              placeholder="Search tasks..." 
              maxLength={40}
              className="h-9 bg-muted/20 border-none rounded-lg text-xs" 
            />
          </div>
          <CommandList className="max-h-60 p-1">
            <CommandEmpty className="py-8">
              <Typography variant="extraSmallText" className="text-center italic block">No tasks found in this project.</Typography>
            </CommandEmpty>
            <CommandGroup>
              {selectedTaskId && (
                <CommandItem 
                  value="---unlink-task---"
                  onSelect={() => handleSelect(null)}
                  className="text-xs gap-3 p-2 rounded-xl cursor-pointer mb-1 hover:bg-red-500/5 hover:text-red-600 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </div>
                  <Typography className="font-bold">Unlink current task</Typography>
                </CommandItem>
              )}
              
              {tasks?.map((task) => (
                <CommandItem
                  key={task._id}
                  value={task.title}
                  onSelect={() => handleSelect(task._id)}
                  className={cn(
                    "text-xs gap-3 p-2 rounded-xl cursor-pointer mb-1 transition-all",
                    selectedTaskId === task._id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    selectedTaskId === task._id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Target className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col flex-1 truncate text-left">
                    <Typography className="font-bold truncate">{task.title}</Typography>
                    <Typography className="text-[9px] opacity-40 font-black uppercase tracking-widest">
                      {task.status.replace(/_/g, " ")}
                    </Typography>
                  </div>
                  {selectedTaskId === task._id && <Check className="h-3.5 w-3.5 animate-in zoom-in duration-200" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
