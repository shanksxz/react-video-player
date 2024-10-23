# React Video Player

![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

An advanced, customizable video player built with React, TypeScript, and Tailwind CSS. This project demonstrates modern web development practices and provides a feature-rich video playback experience.

## Features

- 🎥 Smooth video playback with custom controls
- 🖱️ Drag and drop file upload
- 🖼️ Video preview thumbnails
- ⌨️ Keyboard shortcuts for easy control
- 🔊 Volume control with mute toggle
- ⏩ Playback speed adjustment
- 🔁 Autoplay functionality
- 📱 Responsive design for various screen sizes
- ♿ Accessibility features for keyboard navigation

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/shanksxz/react-video-player.git
   ```

2. Navigate to the project directory:
   ```
   cd react-video-player
   ```

3. Install dependencies:
   ```
   bun install # or npm install
   ```

4. Start the development server:
   ```
   bun run dev # or npm run dev
   ```

## Usage

1. Open the application in your web browser.
2. Drag and drop a video file onto the designated area or click to select a file.
3. Once the video is loaded, use the on-screen controls or keyboard shortcuts to control playback.

### Keyboard Shortcuts

- Space or K: Play/Pause
- M: Mute/Unmute
- F: Toggle Fullscreen
- Left Arrow: Seek backward 5 seconds
- Right Arrow: Seek forward 5 seconds
- 0-9: Jump to 0%-90% of the video duration

## Project Structure

```
src/
├── components/
│   ├── DragDrop.tsx
│   ├── VideoPlayer.tsx
│   ├── VideoControls.tsx
│   └── VideoProgress.tsx
├── hooks/
│   └── useFfmpeg.ts
├── lib/
│   └── utils.ts
└── app.tsx
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [FFmpeg](https://ffmpeg.org/) for video processing
