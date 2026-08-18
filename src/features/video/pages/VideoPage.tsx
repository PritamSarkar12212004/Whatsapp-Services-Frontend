import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
    PlayCircleOutlined,
    VideoCameraOutlined,
    UploadOutlined,
} from "@ant-design/icons";

interface VideoItem {
    id: number;
    name: string;
    duration: string;
    size: string;
    thumbnail: string;
}

const VideoPage: React.FC = () => {
    const [videos] = useState<VideoItem[]>([
        {
            id: 1,
            name: "Video Message 1",
            duration: "2:30",
            size: "15.2 MB",
            thumbnail: "https://via.placeholder.com/320x180/10b981/ffffff?text=Video+1",
        },
        {
            id: 2,
            name: "Video Message 2",
            duration: "1:45",
            size: "10.8 MB",
            thumbnail: "https://via.placeholder.com/320x180/3b82f6/ffffff?text=Video+2",
        },
        {
            id: 3,
            name: "Video Message 3",
            duration: "3:15",
            size: "20.5 MB",
            thumbnail: "https://via.placeholder.com/320x180/8b5cf6/ffffff?text=Video+3",
        },
    ]);

    const handleUpload = () => {
        // TODO: Implement video upload functionality
        console.log("Upload video file");
    };

    return (
        <MainLayout>
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Video
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage and play video messages
                        </p>
                    </div>

                    <button
                        onClick={handleUpload}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                    >
                        <UploadOutlined />
                        Upload Video
                    </button>
                </div>

                {/* Video Grid */}
                <div className="flex-1 overflow-y-auto py-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video overflow-hidden bg-gray-100">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.name}
                                        className="h-full w-full object-cover transition group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                                        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-emerald-600 transition hover:bg-white">
                                            <PlayCircleOutlined className="text-2xl" />
                                        </button>
                                    </div>

                                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                                        {video.duration}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {video.name}
                                    </h3>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            {video.size}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                            <VideoCameraOutlined />
                                            Video
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default VideoPage;