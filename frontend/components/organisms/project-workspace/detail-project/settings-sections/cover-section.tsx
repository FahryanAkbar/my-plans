"use client";

import { Card, CardHeader, CardTitle, CardContent, Typography } from "@/components/atoms";
import { SingleImageDropzone } from "@/components/molecules/single-image-uploader";

interface CoverSectionProps {
  imageValue: string | File;
  isPending: boolean;
  onChangeImage: (file?: File) => void;
}

export const CoverSection = ({
  imageValue,
  isPending,
  onChangeImage,
}: CoverSectionProps) => {
  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Project Cover
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SingleImageDropzone
          value={imageValue}
          disabled={isPending}
          onChange={onChangeImage}
          className="w-full h-56 rounded-xl border-2 border-dashed"
        />
        <Typography variant="muted" className="text-xs mt-3 text-center">
          Recommended 1200x600px
        </Typography>
      </CardContent>
    </Card>
  );
};
