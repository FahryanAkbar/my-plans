'use client'

import { useEffect, useState } from "react";
import { File, Folder } from "lucide-react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/atoms";
import { useSearch } from "@/hooks";
import { api } from "@/convex/_generated/api";

export const SearchCommand = () => {
  const { user } = useUser();
  const router = useRouter();
  const documents = useQuery(api.documents.getSearch);
  const projects = useQuery(api.project.getUserProjects);
  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true); // waspada
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    }

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (url: string) => {
    router.push(url);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command>
        <CommandInput
          placeholder={`Search ${user?.fullName}'s Workspace...`}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {projects && projects.length > 0 && (
            <CommandGroup heading="Projects">
              {projects.map((project) => project && (
                <CommandItem
                  key={project._id}
                  value={`project-${project._id}-${project.name}`}
                  title={project.name}
                  onSelect={() => onSelect(`/project/${project._id}`)}
                  className="cursor-pointer"
                >
                  {project.icon ? (
                    <span className="mr-2 text-[18px] leading-none">{project.icon}</span>
                  ) : (
                    <Folder className="mr-2 h-4 w-4 text-primary" />
                  )}
                  <span>{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Documents">
            {documents?.map((document) => (
              <CommandItem
                key={document._id}
                value={`document-${document._id}-${document.title}`}
                title={document.title}
                onSelect={() => onSelect(`/documents/${document._id}`)}
                className="cursor-pointer"
              >
                {document.icon ? (
                  <p className="mr-2 text-[18px]">
                    {document.icon}
                  </p>
                ) : (
                  <File className="mr-2 h-4 w-4" />
                )}
                <span>{document.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}