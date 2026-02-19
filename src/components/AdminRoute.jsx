import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-4 text-white">Loading...</div>;

    if (!user || user.role !== "Admin") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
