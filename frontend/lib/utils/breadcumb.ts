export interface BreadcrumbProps {
  label: string
  href: string
}

export function generateBreadcrumbs(
  pathname: string, 
  idMap?: Record<string, string>
): BreadcrumbProps[] {
  const paths = pathname.split('/').filter(Boolean)

  const breadcrumbs: BreadcrumbProps[] = [{ label: 'Home', href: '/monitoring' }]

  let currentPath = ''
  paths.forEach((path, index) => {
    currentPath += `/${path}`

    if (currentPath === '/monitoring') return

    const rawLabel = path.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    const label = idMap?.[path] || rawLabel

    breadcrumbs.push({
      label,
      href: currentPath,
    })
  })

  return breadcrumbs
}