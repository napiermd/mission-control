"use client"

import { useEffect } from "react"

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Drawer({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Drawer panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-space-dark border-l border-space-border overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-space-border">
          <h2 className="section-header">{title}</h2>
          <button
            onClick={onClose}
            className="text-hud-muted hover:text-hud-amber text-sm transition-colors"
          >
            [close]
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
