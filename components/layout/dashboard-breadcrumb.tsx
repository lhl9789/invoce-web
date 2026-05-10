"use client"

import { usePathname } from "next/navigation"
import { dashboardSidebarNav } from "@/config/dashboard"

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  const current = dashboardSidebarNav.find((item) => item.href === pathname)
  return <span className="text-sm font-medium">{current?.title ?? "대시보드"}</span>
}
