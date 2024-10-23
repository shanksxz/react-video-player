"use client"

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useLayoutEffect, useRef, useState } from "react";

export const useFfmpeg = () => {
    const ffmpegRef = useRef(new FFmpeg());
    const [loaded, setLoaded] = useState(false);

    useLayoutEffect(() => {
        (async () => {
            console.log('loading ffmpeg');
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
            const ffmpeg = ffmpegRef.current;
            ffmpeg.on("log", ({ message }) => {
                console.log(message);
            });
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
        }
        )();
    }, []);

    return { ffmpeg : ffmpegRef.current , loaded };
}
