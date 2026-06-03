// 공통 푸터 컴포넌트
export function Footer() {
  return (
    <footer className="border-t py-6 px-4 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} Invoce. All rights reserved.
    </footer>
  )
}
