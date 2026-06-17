import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib"

type LogoProps = {
  href?: string
  name?: string
  showLabel?: boolean
  iconSize?: number
  lightSrc?: string
  darkSrc?: string
  alt?: string
  priority?: boolean
  className?: string
  iconClassName?: string
  labelClassName?: string
}

function LogoContent({
  name,
  showLabel,
  iconSize,
  lightSrc,
  darkSrc,
  alt,
  priority,
  iconClassName,
  labelClassName,
}: Omit<LogoProps, "href" | "className">) {
  return (
    <>
      <Image
        src={lightSrc ?? "/logo.png"}
        width={iconSize ? Math.round(iconSize * 1.5) : 60}
        height={iconSize ?? 40}
        alt={alt ?? "Logo"}
        className={cn("object-contain dark:hidden", iconClassName)}
        priority={priority}
      />
      <Image
        src={darkSrc ?? "/logo.png"}
        width={iconSize ? Math.round(iconSize * 1.5) : 60}
        height={iconSize ?? 40}
        alt={alt ?? "Logo"}
        className={cn("hidden object-contain dark:block", iconClassName)}
        priority={priority}
      />
      {showLabel !== false && (
        <span className={cn("font-semibold tracking-tight", labelClassName)}>
          {name ?? "My Plans"}
        </span>
      )}
    </>
  )
}

export function Logo({
  href,
  name = "My Plans",
  showLabel = true,
  iconSize = 40,
  lightSrc = "/logo.png",
  darkSrc = "/logo.png",
  alt = "Logo",
  priority = false,
  className,
  iconClassName,
  labelClassName,
}: LogoProps) {
  const content = (
    <LogoContent
      name={name}
      showLabel={showLabel}
      iconSize={iconSize}
      lightSrc={lightSrc}
      darkSrc={darkSrc}
      alt={alt}
      priority={priority}
      iconClassName={iconClassName}
      labelClassName={labelClassName}
    />
  )

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${name} home`}
        className={cn("inline-flex items-center gap-2", className)}
      >
        {content}
      </Link>
    )
  }

  return <div className={cn("inline-flex items-center gap-2", className)}>{content}</div>
}
