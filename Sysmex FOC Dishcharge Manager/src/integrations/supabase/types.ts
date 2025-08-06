export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instanciate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "12.2.12 (cd3cf9e)";
	};
	public: {
		Tables: {
			client_list: {
				Row: {
					"Client Name": string | null;
					Client_Email: string;
					Client_ID: string;
				};
				Insert: {
					"Client Name"?: string | null;
					Client_Email: string;
					Client_ID?: string;
				};
				Update: {
					"Client Name"?: string | null;
					Client_Email?: string;
					Client_ID?: string;
				};
				Relationships: [];
			};
			Invoice_Log: {
				Row: {
					Approved_By: string;
					Client_Email: string;
					Client_Name: string;
					Invoice_Date: string;
					Invoice_ID: string;
					Order_Price: number;
					Price_of_Product: number;
					Product: string;
					Quantity: number;
					Seller_Email: string;
					Seller_Name: string;
				};
				Insert: {
					Approved_By: string;
					Client_Email: string;
					Client_Name: string;
					Invoice_Date: string;
					Invoice_ID: string;
					Order_Price: number;
					Price_of_Product: number;
					Product: string;
					Quantity?: number;
					Seller_Email: string;
					Seller_Name: string;
				};
				Update: {
					Approved_By?: string;
					Client_Email?: string;
					Client_Name?: string;
					Invoice_Date?: string;
					Invoice_ID?: string;
					Order_Price?: number;
					Price_of_Product?: number;
					Product?: string;
					Quantity?: number;
					Seller_Email?: string;
					Seller_Name?: string;
				};
				Relationships: [];
			};
			product_list: {
				Row: {
					Available_Quantity: number;
					Product_ID: string;
					Product_Name: string;
					Product_Price: number;
				};
				Insert: {
					Available_Quantity: number;
					Product_ID?: string;
					Product_Name: string;
					Product_Price: number;
				};
				Update: {
					Available_Quantity?: number;
					Product_ID?: string;
					Product_Name?: string;
					Product_Price?: number;
				};
				Relationships: [];
			};
			seller_list: {
				Row: {
					Boss_Email: string;
					Boss_Name: string;
					Seller_Email: string;
					Seller_ID: string;
					Seller_Name: string;
				};
				Insert: {
					Boss_Email: string;
					Boss_Name: string;
					Seller_Email: string;
					Seller_ID?: string;
					Seller_Name: string;
				};
				Update: {
					Boss_Email?: string;
					Boss_Name?: string;
					Seller_Email?: string;
					Seller_ID?: string;
					Seller_Name?: string;
				};
				Relationships: [];
			};
			user_credentials: {
				Row: {
					id: string;
					username: string;
					password_hash: string;
					full_name: string;
					role: string;
				};
				Insert: {
					id?: string;
					username: string;
					password_hash: string;
					full_name?: string;
					role: string;
				};
				Update: {
					id?: string;
					username?: string;
					password_hash?: string;
					full_name?: string;
					role?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
			DefaultSchema["Views"])
	? (DefaultSchema["Tables"] &
			DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
	? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
	? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
