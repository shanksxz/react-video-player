import React, { useRef, useState } from "react"
import { formatTime } from "@/utils"

interface VideoProgressProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  previewImages: string[]
}

export default function VideoProgress({ currentTime, duration, onSeek, previewImages }: VideoProgressProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState(0)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newTime = pos * duration

    onSeek(newTime)
  }

  const handlePreviewMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setPreviewPosition(pos)
    setShowPreview(true)
  }

  return (
    <div
      ref={progressBarRef}
      className="relative w-full h-1 bg-gray-600 mb-4 cursor-pointer"
      onClick={handleSeek}
      onMouseMove={handlePreviewMove}
      onMouseLeave={() => setShowPreview(false)}
    >
      <div className="h-full bg-red-600" style={{ width: `${(currentTime / duration) * 100}%` }} />
      {showPreview && previewImages.length > 0 && (
        <div
          className="absolute bottom-8 transform -translate-x-1/2"
          style={{ left: `${previewPosition * 100}%` }}
        >
          <img
            src={previewImages[Math.min(Math.floor(previewPosition * previewImages.length), previewImages.length - 1)]}
            alt="Preview"
            className="w-32 h-18 object-cover rounded"
          />
          <div className="text-white text-xs mt-1 text-center">{formatTime(previewPosition * duration)}</div>
        </div>
      )}
    </div>
  )
}
