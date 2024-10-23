import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import VideoPlayer from "./VideoPlayer"
import { toast } from "sonner"

export default function DragDrop() {
  const [isDragging, setIsDragging] = useState(false)
  const [url, setUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (file: File | undefined) => {
    if (file && file.type.startsWith("video")) {
      const url = URL.createObjectURL(file)
      toast.success("Redirecting to video player...")
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setUrl(url)
    } else {
      toast.error("Please select a valid video file.")
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileChange(droppedFile)
  }

  return (
    <div className="flex md:p-6 p-2 items-center justify-center h-dvh w-full bg-background">
      {!url ? (
        <div
          className={`w-full h-full border-2 border-dashed rounded-md flex flex-col items-center justify-center space-y-4 text-muted-foreground transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "hover:border-primary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-16 h-16" />
          <p className="text-lg text-center p-2">
            {isDragging ? "Drop the video here" : "Drag and drop a video or click to upload"}
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            id="file-upload"
            accept="video/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              handleFileChange(file)
            }}
          />
          <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
            Select Video
          </Button>
        </div>
      ) : (
        <VideoPlayer src={url} />
      )}
    </div>
  )
}
