import React from "react";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="w-full h-screen">
            <Sidebar />
            <main className="lg:ml-64 p-6 h-[calc(100vh-3rem)] overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;