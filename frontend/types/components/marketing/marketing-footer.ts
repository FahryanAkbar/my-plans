export type FooterLinkItem = {
  label: string
  href: string
  external?: boolean
}

export type MarketingFooterProps = {
  className?: string
  logoHref?: string
  links?: FooterLinkItem[]
}

export const DEFAULT_LINKS: FooterLinkItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
]