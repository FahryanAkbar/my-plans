'use client'

import { usePathname } from 'next/navigation'
import { useQuery, useConvexAuth } from 'convex/react'

import { api } from '@/convex/_generated/api'
import { generateBreadcrumbs } from '@/lib'

export function useBreadcrumbs() {
  const pathname = usePathname()
  const { isAuthenticated } = useConvexAuth()
  
  const projects = useQuery(
    api.project.getUserProjects, 
    isAuthenticated ? undefined : "skip"
  )
  const documents = useQuery(
    api.documents.getSearch, 
    isAuthenticated ? undefined : "skip"
  )
  
  const isJoinPage = pathname.startsWith('/join/')
  const joinToken = isJoinPage ? pathname.split('/join/')[1] : undefined

  const invitation = useQuery(
    api.invitation.previewInvitationByToken,
    joinToken ? { token: joinToken } : "skip"
  )
  
  const idMap: Record<string, string> = {}
  
  if (projects) {
    projects.forEach(p => {
      if (p) idMap[p._id] = p.name
    })
  }

  if (documents) {
    documents.forEach(d => {
      if (d) idMap[d._id] = d.title || 'Untitled'
    })
  }

  if (invitation && !("error" in invitation) && joinToken) {
    idMap[joinToken] = invitation.projectName
  }

  return generateBreadcrumbs(pathname, idMap)
}