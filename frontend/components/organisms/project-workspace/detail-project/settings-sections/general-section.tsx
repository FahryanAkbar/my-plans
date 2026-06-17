"use client";

import { Card, CardHeader, CardTitle, CardContent, Input, Textarea, Typography, Button } from "@/components/atoms";
import { IconPicker } from "@/components/molecules";
import { Plus, Trash } from "lucide-react";

interface GeneralSectionProps {
  name: string;
  icon: string;
  description: string;
  onNameChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const GeneralSection = ({
  name,
  icon,
  description,
  onNameChange,
  onIconChange,
  onDescriptionChange,
}: GeneralSectionProps) => {
  return (
    <Card className="rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          General Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="space-y-2">
            <Typography variant="smallText">Icon</Typography>
            <div className="flex items-center gap-2">
              <IconPicker onChange={onIconChange} asChild>
                <Button 
                  variant="outline" 
                  className="h-10 aspect-square p-0 flex items-center justify-center text-xl rounded-lg border-border/50 hover:bg-muted/50 transition-colors"
                >
                  {icon || <Plus className="h-4 w-4 opacity-60" />}
                </Button>
              </IconPicker>
              {icon && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => onIconChange("")}
                  title="Remove icon"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2 flex-1">
            <Typography variant="smallText">Project Name</Typography>
            <Input 
              value={name}
              maxLength={30}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Typography variant="smallText">Description</Typography>
          <Textarea 
            value={description}
            maxLength={150}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe your project..."
            className="min-h-28"
          />
        </div>
      </CardContent>
    </Card>
  );
};
