import { useState, useRef, useEffect } from "react";
import { fetchFile } from "@ffmpeg/util";
import { useFfmpeg } from "@/hooks/useFfmpeg";
import { formatTime } from "@/utils";
import VideoControls from "./VideoControls";
import VideoProgress from "./VideoProgress";

export default function VideoPlayer({
  src = "/placeholder.mp4",
}: {
  src?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { ffmpeg, loaded } = useFfmpeg();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("ended", handleVideoEnd);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettings) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseLeave = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (!showSettings) {
        setShowControls(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    playerRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      playerRef.current?.removeEventListener("mouseleave", handleMouseLeave);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showSettings]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (loaded && videoRef.current && !isGeneratingPreviews) {
      generatePreviewImages();
    }
  }, [loaded, src]);

  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  const generatePreviewImages = async () => {
    if (!videoRef.current || !loaded || isGeneratingPreviews) return;
    try {
      setIsGeneratingPreviews(true);
      const video = videoRef.current;
      if (!video.duration) {
        await new Promise((resolve) => {
          video.addEventListener("loadedmetadata", resolve, { once: true });
        });
      }

      let totalFrames = Math.floor(
        Math.max(0.25 * video.duration, Math.min(0.5 * video.duration, 30)),
      );
      console.log("Generating", totalFrames, "preview frames");

      const frameInterval = Math.floor(video.duration / totalFrames);
      const videoData = await fetchFile(src);
      await ffmpeg.writeFile("input.mp4", videoData);
      const newPreviewImages: string[] = [];

      for (let i = 0; i < totalFrames; i++) {
        const time = formatTime(i * frameInterval);
        const outputFileName = `frame${i}.jpg`;
        try {
          await ffmpeg.exec([
            "-ss",
            time,
            "-i",
            "input.mp4",
            "-vf",
            "scale=120:-1",
            "-vframes",
            "1",
            "-q:v",
            "2",
            outputFileName,
          ]);

          const data = await ffmpeg.readFile(outputFileName);
          const blob = new Blob([data], { type: "image/jpeg" });
          const url = URL.createObjectURL(blob);
          newPreviewImages.push(url);

          await ffmpeg.deleteFile(outputFileName);
        } catch (frameError) {
          console.warn(`Error generating preview frame ${i}:`, frameError);
          newPreviewImages.push("/placeholder-preview.jpg");
        }
      }
      await ffmpeg.deleteFile("input.mp4");

      previewImages.forEach((url) => URL.revokeObjectURL(url));
      setPreviewImages(newPreviewImages);
    } catch (error) {
      console.error("Error generating preview images:", error);
    } finally {
      setIsGeneratingPreviews(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (isAutoplay && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    if (videoRef.current) {
      const volumeValue = newVolume[0];
      videoRef.current.volume = volumeValue;
      setVolume(volumeValue);
      setIsMuted(volumeValue === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (newMutedState) {
        videoRef.current.volume = 0;
        setVolume(0);
      } else {
        videoRef.current.volume = 1;
        setVolume(1);
      }
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;

    try {
      if (!isFullscreen) {
        await playerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds),
      );
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleAutoplay = () => {
    setIsAutoplay(!isAutoplay);
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "f":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "m":
        e.preventDefault();
        toggleMute();
        break;
      case "arrowleft":
        e.preventDefault();
        skip(-5);
        break;
      case "arrowright":
        e.preventDefault();
        skip(5);
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = (duration * parseInt(e.key)) / 10;
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [duration]);

  return (
    <div
      ref={playerRef}
      className="relative w-full max-w-4xl mx-auto bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (!showSettings) {
          setShowControls(false);
        }
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full cursor-pointer"
        onClick={togglePlay}
        playsInline
      />
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300">
          <VideoProgress
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            previewImages={previewImages}
          />
          <VideoControls
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            skip={skip}
            isMuted={isMuted}
            toggleMute={toggleMute}
            volume={volume}
            handleVolumeChange={handleVolumeChange}
            currentTime={currentTime}
            duration={duration}
            isAutoplay={isAutoplay}
            toggleAutoplay={toggleAutoplay}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            playbackSpeed={playbackSpeed}
            changePlaybackSpeed={changePlaybackSpeed}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        </div>
      )}
      <div
        className="absolute inset-0 md:hidden"
        onTouchStart={(e) => {
          const touchX = e.touches[0].clientX;
          const third = window.innerWidth / 3;

          if (touchX < third) {
            skip(-10);
          } else if (touchX > third * 2) {
            skip(10);
          } else {
            togglePlay();
          }
        }}
      />
      <div className="sr-only">
        Video player with keyboard shortcuts: Space or K to play/pause, M to
        mute/unmute, F to toggle fullscreen, Left/Right arrows to seek, 0-9 to
        jump to percentage of video
      </div>
    </div>
  );
}
