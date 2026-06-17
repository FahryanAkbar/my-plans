"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Trash } from "lucide-react";

import { Drawer, DrawerContent, Dialog, DialogContent, DialogTrigger, DialogTitle, VisuallyHidden, Typography } from "@/components/atoms";
import { DocumentList, Item, ProjectList, SidebarNavigation, TrashBox } from "@/components/organisms";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: () => void;
}

export const MobileSidebar = ({
  open,
  onOpenChange,
  onCreate,
}: MobileSidebarProps) => {
  const pathname = usePathname();
  const [trashOpen, setTrashOpen] = useState(false);

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Drawer direction="left" open={open} onOpenChange={onOpenChange}>
      <DrawerContent data-vaul-no-drag className="h-full w-[85vw] sm:w-[320px] rounded-r-xl border-r bg-secondary p-0">
        <aside className="h-full overflow-y-auto py-3">
          <SidebarNavigation handleCreate={onCreate} />

          <div className="mt-6">
            <Typography
              variant="muted"
              className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-4 px-4"
            >
              My Documents
            </Typography>
            <DocumentList />
            <Item onClick={onCreate} icon={Plus} label="Add a page" />
          </div>

          <div className="mt-2">
            <ProjectList />
          </div>

          <div className="mt-4 px-2">
            <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
              <DialogTrigger className="w-full">
                <Item label="Trash" icon={Trash} />
              </DialogTrigger>
              <DialogContent className="p-0 max-w-md w-[90vw] rounded-xl overflow-hidden">
                <VisuallyHidden>
                  <DialogTitle>Trash</DialogTitle>
                </VisuallyHidden>
                <div className="p-4 bg-background">
                  <TrashBox />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </aside>
      </DrawerContent>
    </Drawer>
  );
};
