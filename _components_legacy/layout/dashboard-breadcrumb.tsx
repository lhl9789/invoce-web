"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { dashboardSidebarNav } from "@/config/dashboard"
import { ROUTES } from "@/lib/constants"

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const current = dashboardSidebarNav.find((item) => item.href === pathname)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={ROUTES.DASHBOARD}>대시보드</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {current && pathname !== ROUTES.DASHBOARD && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
