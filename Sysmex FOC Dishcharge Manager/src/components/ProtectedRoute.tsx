import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (user.role === "admin" && location.pathname !== "/dashboard") {
		return <Navigate to="/dashboard" replace />;
	}

	if (user.role === "seller" && location.pathname !== "/form") {
		return <Navigate to="/form" replace />;
	}

	return <>{children}</>;
}
