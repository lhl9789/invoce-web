import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

/** 모바일 뷰포트 여부를 감지하는 훅 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    function onChange() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
