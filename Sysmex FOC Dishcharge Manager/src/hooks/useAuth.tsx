import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";
import { toast } from "@/hooks/use-toast";

interface User {
	id: string;
	username: string;
	full_name: string | null;
	role: string;
}

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	loading: boolean;
	getRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user is already logged in
		const savedUser = localStorage.getItem("adminUser");
		if (savedUser) {
			setUser(JSON.parse(savedUser));
		}
		setLoading(false);
	}, []);

	const login = async (
		username: string,
		password: string
	): Promise<boolean> => {
		try {
			setLoading(true);

			// Fetch user from Supabase
			const { data, error } = await supabase
				.from("user_credentials")
				.select("id, username, password_hash, full_name, role")
				.eq("username", username)
				.single();

			if (error || !data) {
				toast({
					title: "Login Failed",
					description: "Invalid username or password",
					variant: "destructive",
				});
				return false;
			}

			// Compare entered password with hashed password
			const isPasswordValid = await bcrypt.compare(
				password,
				data.password_hash
			);
			if (!isPasswordValid) {
				toast({
					title: "Login Failed",
					description: "Invalid username or password",
					variant: "destructive",
				});
				return false;
			}

			// Construct user object
			const userData: User = {
				id: data.id,
				username: data.username,
				full_name: data.full_name,
				role: data.role,
			};

			// Store user in state and localStorage
			setUser(userData);
			localStorage.setItem("adminUser", JSON.stringify(userData));

			toast({
				title: "Login Successful",
				description: `Welcome back, ${
					userData.full_name || userData.username
				}!`,
			});

			return true;
		} catch (error) {
			console.error("Login error:", error);
			toast({
				title: "Login Failed",
				description: "An error occurred during login",
				variant: "destructive",
			});
			return false;
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("adminUser");
		toast({
			title: "Logged Out",
			description: "You have been successfully logged out",
		});
	};

	const getRole = () => user?.role || null;

	return (
		<AuthContext.Provider value={{ user, login, logout, loading, getRole }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
