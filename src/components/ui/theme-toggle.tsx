"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

function subscribe() {
  return () => {}
}

/** 하이드레이션 완료 여부 — 서버에서는 false, 클라이언트 마운트 후 true */
function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

export function ThemeToggle() {
  const hydrated = useHydrated()
  const { theme, setTheme } = useTheme()

  if (!hydrated) {
    // 마운트 전에는 빈 버튼 자리만 차지해 레이아웃 이동 방지
    return <Button variant="ghost" size="icon" className="invisible" aria-hidden />
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {isDark ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  )
}
