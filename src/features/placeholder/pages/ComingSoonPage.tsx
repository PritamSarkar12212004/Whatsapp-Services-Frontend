import React from "react";
import { ToolOutlined } from "@ant-design/icons";

interface ComingSoonPageProps {
    title: string;
    description?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
    title,
    description,
}) => {
    return (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ToolOutlined style={{ fontSize: 28 }} />
            </div>

            <h1 className="mt-6 text-2xl font-semibold text-gray-900">
                {title}
            </h1>

            <p className="mt-2 max-w-md text-sm text-gray-500">
                {description ||
                    "This page is coming soon. It will be available in an upcoming update."}
            </p>
        </div>
    );
};

export default ComingSoonPage;
