"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ImageIcon, X, MoveVertical } from "lucide-react";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { cn, useEdgeStore, EdgeStoreProvider } from "@/lib";
import { useCoverImage } from "@/hooks";

import { Button, Skeleton } from "@/components/atoms";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface CoverImageProps {
  url?: string;
  preview?: boolean;
}

export const Cover = ({
  url,
  preview,
}: CoverImageProps) => {
  return (
    <EdgeStoreProvider>
      <CoverContent url={url} preview={preview} />
    </EdgeStoreProvider>
  );
};

const CoverContent = ({
  url,
  preview,
}: CoverImageProps) => {
  const { edgestore } = useEdgeStore();
  const params = useParams();
  const coverImage = useCoverImage();
  
  const removeCoverImage = useMutation(api.documents.removeCoverImage);
  const updateDocument = useMutation(api.documents.update);

  const defaultPosY = 50;
  
  const parsePosY = (imgUrl?: string) => {
    if (!imgUrl) return defaultPosY;
    const match = imgUrl.match(/#pos=([0-9.]+)/);
    return match ? parseFloat(match[1]) : defaultPosY;
  };

  const [isRepositioning, setIsRepositioning] = useState(false);
  const [positionY, setPositionY] = useState(parsePosY(url));

  const startY = useRef(0);
  const startPos = useRef(positionY);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isRepositioning) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setPositionY(parsePosY(url));
    }
  }, [url, isRepositioning]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isRepositioning) return;
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startPos.current = positionY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !isRepositioning) return;
    e.preventDefault();
    
    const deltaY = e.clientY - startY.current;
    const containerHeight = e.currentTarget.clientHeight;
    
    // Factor to make the drag movement natural alongside cursor
    const percentageDelta = (deltaY / containerHeight) * 100;
    let newPos = startPos.current - percentageDelta;
    
    if (newPos < 0) newPos = 0;
    if (newPos > 100) newPos = 100;
    
    setPositionY(newPos);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const onSavePosition = async () => {
    if (!params.documentId || !url) return;
    try {
      const cleanUrl = url.split('#')[0];
      const newUrl = `${cleanUrl}#pos=${positionY.toFixed(2)}`;

      await updateDocument({
        id: params.documentId as Id<"documents">,
        coverImage: newUrl
      });
      setIsRepositioning(false);
    } catch {
      toast.error("Gagal menyimpan posisi cover.");
    }
  };

  const onCancelPosition = () => {
    setPositionY(parsePosY(url));
    setIsRepositioning(false);
  };

  const cleanUrl = url ? url.split('#')[0] : "";

  const resolveEdgeStoreDeleteUrl = (fileUrl: string) => {
    try {
      const parsed = new URL(fileUrl);
      const proxiedUrl = parsed.searchParams.get("url");
      return proxiedUrl ?? fileUrl;
    } catch {
      return fileUrl;
    }
  };

  const onRemove = async () => {
    if (!params.documentId) {
      toast.error("Document ID tidak ditemukan.");
      return;
    }

    try {
      await removeCoverImage({
        id: params.documentId as Id<"documents">
      });

      if (cleanUrl) {
        try {
          await fetch("/api/edgestore/init", {
            method: "GET",
            credentials: "include",
          });

          const deleteUrl = resolveEdgeStoreDeleteUrl(cleanUrl);
          await edgestore.publicFiles.delete({ url: deleteUrl });
        } catch (error) {
          console.error("EdgeStore delete failed:", error);
        }
      }
    } catch (error) {
      toast.error("Gagal menghapus cover.");
      console.error(error);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full h-[35vh] group",
        !url && "h-[12vh]",
        url && "bg-muted",
      )}
    >
      {!!url && (
        <Image
          src={cleanUrl}
          fill
          alt="Cover"
          style={{ objectPosition: `center ${positionY}%` }}
          className={cn("object-cover", isRepositioning ? "pointer-events-none" : "")}
          unoptimized
        />
      )}

      {isRepositioning && (
         <div 
           className="absolute inset-0 cursor-move z-10 flex items-center justify-center touch-none"
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerLeave={handlePointerUp}
         >
            <div className="bg-white/50 text-gray-600 text-xs px-3 py-1.5 rounded-md font-medium pointer-events-none mt-10">
                Drag image to reposition
            </div>
         </div>
      )}

      {url && !preview && !isRepositioning && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2 z-20 transition-opacity">
          <Button
            onClick={() => coverImage.onReplace(cleanUrl)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            onClick={() => setIsRepositioning(true)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <MoveVertical className="h-4 w-4 mr-2" />
            Reposition
          </Button>
          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}

      {url && !preview && isRepositioning && (
        <div className="absolute bottom-5 right-5 flex items-center gap-x-2 z-50">
            <Button
              onClick={onSavePosition}
              className="text-xs font-semibold"
              variant="outline"
              size="sm"
            >
               Save Position
            </Button>
            <Button
              onClick={onCancelPosition}
              className="text-xs"
              variant="outline"
              size="sm"
            >
               Cancel
            </Button>
        </div>
      )}
    </div>
  )
}

Cover.Skeleton = function CoverSkeleton() {
  return (
    <Skeleton className="w-full h-[12vh]" />
  )
}
