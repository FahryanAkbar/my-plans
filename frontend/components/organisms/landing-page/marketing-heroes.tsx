import Image from "next/image"

import { cn } from "@/lib"
import { MarketingHeroesProps } from "@/types"

export function MarketingHeroes({
  className,
  firstImageAlt = "Documents",
  secondImageAlt = "Reading",
  firstImageLightSrc = "/texting.svg",
  firstImageDarkSrc = "/texting.svg",
  secondImageLightSrc = "/newsletter.svg",
  secondImageDarkSrc = "/newsletter.svg",
  showSecondImage = true,
  priority = false,
}: MarketingHeroesProps) {
  return (
    <div className={cn("flex max-w-5xl flex-col items-center justify-center", className)}>
      <div className="flex items-center">
        <div className="relative h-60 w-60 sm:h-70 sm:w-70 md:h-80 md:w-80">
          <Image
            src={firstImageLightSrc}
            fill
            alt={firstImageAlt}
            className="object-contain dark:hidden"
            sizes="(max-width: 768px) 240px, 320px"
            priority={priority}
          />
          <Image
            src={firstImageDarkSrc}
            fill
            alt={firstImageAlt}
            className="hidden object-contain dark:block"
            sizes="(max-width: 768px) 240px, 320px"
            priority={priority}
          />
        </div>

        {showSecondImage && (
          <div className="relative hidden h-80 w-80 md:block">
            <Image
              src={secondImageLightSrc}
              fill
              alt={secondImageAlt}
              className="object-contain dark:hidden"
              sizes="320px"
              priority={priority}
            />
            <Image
              src={secondImageDarkSrc}
              fill
              alt={secondImageAlt}
              className="hidden object-contain dark:block"
              sizes="320px"
              priority={priority}
            />
          </div>
        )}
      </div>
    </div>
  )
}
