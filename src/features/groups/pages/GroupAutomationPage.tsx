import React from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Animation from "@/components/ui/animation/Animation";
import { AnimationConst } from "@/consts/animation/AnimationConst";
import { useWhatsappGroupDetail } from "@/features/groups/hooks/useWhatsappGroupDetail";
import { ArrowLeftOutlined } from "@ant-design/icons";

/** Full-screen shell — sidebar stays, everything else fills the screen. */
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full h-screen">
        <Sidebar />
        <div className="flex h-screen flex-col lg:ml-64">{children}</div>
    </div>
);

const GroupAutomationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: detailData, isLoading } = useWhatsappGroupDetail(id);
    const group = detailData?.data;

    if (isLoading) {
        return (
            <Shell>
                <div className="flex flex-1 items-center justify-center">
                    <Animation
                        source={AnimationConst.Loader}
                        height={200}
                        width={200}
                        loop={true}
                        className="mx-auto"
                    />
                </div>
            </Shell>
        );
    }

    return (
        <Shell>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        to={`/groups/${encodeURIComponent(id!)}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                        title="Back to group"
                    >
                        <ArrowLeftOutlined />
                    </Link>

                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl">
                            Group Automation
                        </h1>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                            {group?.subject ?? "Group"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Blank body */}
            <div className="flex-1 bg-gray-50" />
        </Shell>
    );
};

export default GroupAutomationPage;
