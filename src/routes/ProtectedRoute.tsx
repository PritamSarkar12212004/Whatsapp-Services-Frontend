import { Navigate, Outlet } from "react-router-dom";
import { useStoreToken } from "@/store/zustand/token/useStoreToken";
import { useStoreBascData } from "@/store/zustand/user/useStoreBascData";

const ProtectedRoute = () => {
    const token = useStoreToken((state) => state.token);
    const user = useStoreBascData((state) => state.user);

    if (!token || !user) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;