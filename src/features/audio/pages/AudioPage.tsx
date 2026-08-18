import React, { useState, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    AudioOutlined,
    UploadOutlined,
} from "@ant-design/icons";

interface AudioTrack {
    id: number;
    name: string;
    duration: string;
    size: string;
    isPlaying: boolean;
}

const AudioPage: React.FC = () => {
    const [tracks, setTracks] = useState<AudioTrack[]>([
        {
            id: 1,
            name: "Voice Message 1",
            duration: "0:45",
            size: "1.2 MB",
            isPlaying: false,
        },
        {
            id: 2,
            name: "Voice Message 2",
            duration: "1:30",
            size: "2.5 MB",
            isPlaying: false,
        },
        {
            id: 3,
            name: "Voice Message 3",
            duration: "0:20",
            size: "0.8 MB",
            isPlaying: false,
        },
    ]);

    const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayPause = (trackId: number) => {
        if (currentlyPlaying === trackId) {
            audioRef.current?.pause();
            setCurrentlyPlaying(null);
            setTracks((prev) =>
                prev.map((t) =>
                    t.id === trackId ? { ...t, isPlaying: false } : t
                )
            );
        } else {
            audioRef.current?.pause();
            setCurrentlyPlaying(trackId);
            setTracks((prev) =>
                prev.map((t) =>
                    t.id === trackId
                        ? { ...t, isPlaying: true }
                        : { ...t, isPlaying: false }
                )
            );
        }
    };

    const handleUpload = () => {
        // TODO: Implement audio upload functionality
        console.log("Upload audio file");
    };

    return (
        <MainLayout>
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Audio
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage and play audio messages
                        </p>
                    </div>

                    <button
                        onClick={handleUpload}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                    >
                        <UploadOutlined />
                        Upload Audio
                    </button>
                </div>

                {/* Audio Tracks */}
                <div className="flex-1 space-y-3 overflow-y-auto py-6">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                        >
                            <button
                                onClick={() => handlePlayPause(track.id)}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600"
                            >
                                {track.isPlaying ? (
                                    <PauseCircleOutlined className="text-xl" />
                                ) : (
                                    <PlayCircleOutlined className="text-xl" />
                                )}
                            </button>

                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {track.name}
                                </h3>

                                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                    <span>{track.duration}</span>
                                    <span>•</span>
                                    <span>{track.size}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    <AudioOutlined />
                                    Audio
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default AudioPage;