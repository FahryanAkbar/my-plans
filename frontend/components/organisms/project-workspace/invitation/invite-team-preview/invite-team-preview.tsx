'use client'

import * as React from 'react'
import Image from 'next/image'

import { cn } from '@/lib'
import { Card, CardContent, Typography } from '@/components/atoms'

export interface InviteTeamPreviewProps {
  imageSrc?: string
  darkImageSrc?: string
  imageAlt?: string
  caption?: string
  hiddenOnMobile?: boolean
  className?: string
  containerClassName?: string
}

export const InviteTeamPreview = ({
  imageSrc = '/idea.svg',
  darkImageSrc = '/idea.svg',
  imageAlt = 'Team collaboration preview',
  caption = 'Work better together.',
  hiddenOnMobile = true,
  className,
  containerClassName,
}: InviteTeamPreviewProps) => {
  return (
    <Card
      className={cn(
        'rounded-none border-none ring-0! bg-transparent shadow-none',
        hiddenOnMobile && 'hidden lg:flex',
        className,
      )}
    >
      <CardContent
        className={cn(
          'h-full flex flex-col items-center justify-center gap-4 p-4',
          containerClassName,
        )}
      >
        <div className="w-full max-w-60">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={240}
            height={240}
            className="w-full h-auto object-contain dark:hidden opacity-75 transition-opacity duration-300 hover:opacity-90"
            priority
          />
          <Image
            src={darkImageSrc}
            alt={imageAlt}
            width={240}
            height={240}
            className="hidden w-full h-auto object-contain dark:block opacity-40 transition-opacity duration-300 hover:opacity-55 mix-blend-screen"
            priority
          />
        </div>
        <Typography variant="muted" className="text-center text-xs font-semibold tracking-wide uppercase opacity-60">
          {caption}
        </Typography>
      </CardContent>
    </Card>
  )
}
