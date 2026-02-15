import { Navigate } from "react-router-dom";

export function ProfileRedirect() {
    return <Navigate to="/settings" replace />
}