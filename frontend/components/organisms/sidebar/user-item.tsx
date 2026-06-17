"use client";

import { Settings, UserPlus, LogOut, User, InboxIcon } from "lucide-react";
import { useUser, SignOutButton, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";

import { 
  Avatar, 
  AvatarImage, 
  Typography, 
  Button 
} from "@/components/atoms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/molecules";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSettings } from "@/hooks";
export const UserItem = () => {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const documents = useQuery(api.documents.getSearch) ?? [];
  const settings = useSettings();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div 
          role="button" 
          className="flex items-center text-sm p-3 w-full transition-colors group cursor-pointer rounded-3xl"
        >
          <div className="gap-x-1.5 flex items-center max-w-48">
            <Avatar size="sm" className="border border-zinc-200 dark:border-zinc-800">
              <AvatarImage src={user?.imageUrl} />
            </Avatar>
            <span className="text-start font-medium line-clamp-1 text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors">
              {user?.fullName}&apos;s Teams
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 p-1.5 shadow-xl border-zinc-200 dark:border-zinc-800"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col p-3 pb-4">
          <div 
            className="flex items-center gap-x-3 mb-1 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 p-2 rounded-lg transition-colors group/profile"
            onClick={() => openUserProfile()}
          >
            <Avatar size="default" className="h-9 w-9 ring-1 ring-zinc-100 dark:ring-zinc-900 shadow-sm group-hover/profile:opacity-80 transition-opacity">
              <AvatarImage src={user?.imageUrl} />
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <Typography variant="p" className="text-sm font-semibold truncate max-w-45">
                {user?.fullName}
              </Typography>
              <Typography variant="muted" className="text-[11px] truncate max-w-45">
                {user?.emailAddresses[0].emailAddress}
              </Typography>
              <div className="text-[10px] text-blue-500 font-medium group-hover/profile:underline mt-0.5">
                Manage account
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900" />

        <div className="py-1.5 px-1 flex items-center gap-1">
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start font-normal text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer h-8 px-2 rounded-3xl"
              onClick={() => openUserProfile()}
            >
              <User className="h-3.5 w-3.5 mr-2" />
              Manage Profile
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 justify-start font-normal text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer h-8 px-2 rounded-3xl"
              onClick={settings.onOpen}
            >
              <Settings className="h-3.5 w-3.5 mr-2" />
              Settings
            </Button>
          </DropdownMenuItem>
        </div>

        <div className="py-1.5 px-1 flex items-center gap-1">
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start font-normal text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer h-8 px-2 rounded-3xl"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const text = `${user?.fullName} invites you to join their Teams on MyPlan`;
                  await navigator.clipboard.writeText(text);
                  toast.success("Invite link copied!");
                } catch {
                  toast.error("Failed to copy invite link");
                }
              }}
            >
              <UserPlus className="h-3.5 w-3.5 mr-2" />
              Invite Team
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 justify-start font-normal text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer h-8 px-2 rounded-3xl"
              onClick={settings.onOpen}
            >
              <InboxIcon className="h-3.5 w-3.5 mr-2" />
              Inbox
            </Button>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900" />

        <div className="py-2">
          <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Recent Documents
          </div>
          <div className="max-h-32 overflow-y-auto mt-1 scrollbar-hide">
            {documents.length === 0 ? (
              <div className="px-3 py-2 text-xs italic text-zinc-400">No documents found</div>
            ) : (
              documents.slice(0, 5).map((doc: { _id: string; title?: string }) => (
                <DropdownMenuItem asChild key={doc._id}>
                  <Link 
                    href={`/documents/${doc._id}`} 
                    className="flex w-full px-3 py-1.5 text-xs truncate hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {doc.title || "Untitled"}
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900" />
        
        <div className="p-1">
          <DropdownMenuItem asChild className="w-full cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/20 group">
            <SignOutButton>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/20 h-9 rounded-3xl"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </SignOutButton>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
