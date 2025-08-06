import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Send, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sellers, clients, ofcTypes, products } from "@/data/sampleData";
import { useAuth } from "@/hooks/useAuth";

const formSchema = z.object({
	sellerId: z.string().min(1, "Please select a seller"),
	clientId: z.string().min(1, "Please select a client"),
	ofcTypeId: z.string().min(1, "Please select an OFC type"),
	products: z
		.array(
			z.object({
				productId: z.string().min(1, "Please select a product"),
				quantity: z
					.number()
					.min(1, "Quantity must be at least 1")
					.int("Quantity must be a whole number"),
			})
		)
		.min(1, "Please add at least one product"),
});

type FormData = z.infer<typeof formSchema>;

interface ProductSelection {
	productId: string;
	quantity: number;
	price: number;
}

// Fixed webhook URL for N8N automation
const WEBHOOK_URL =
	"http://localhost:5678/webhook-test/259db6ce-bb6a-4441-b896-36e564ad6372";

export default function SampleRequestForm() {
	const [productSelections, setProductSelections] = useState<
		ProductSelection[]
	>([{ productId: "", quantity: 1, price: 0 }]);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const { logout } = useAuth();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			sellerId: "",
			clientId: "",
			ofcTypeId: "",
			products: [{ productId: "", quantity: 1 }],
		},
	});

	const addProduct = () => {
		const newSelection = { productId: "", quantity: 1, price: 0 };
		setProductSelections([...productSelections, newSelection]);
		const currentProducts = form.getValues("products");
		form.setValue("products", [...currentProducts, newSelection]);
	};

	const removeProduct = (index: number) => {
		if (productSelections.length > 1) {
			const newSelections = productSelections.filter((_, i) => i !== index);
			setProductSelections(newSelections);
			form.setValue("products", newSelections);
		}
	};

	const updateProduct = (
		index: number,
		field: keyof ProductSelection,
		value: string | number
	) => {
		const newSelections = [...productSelections];
		newSelections[index] = { ...newSelections[index], [field]: value };
		setProductSelections(newSelections);
		form.setValue("products", newSelections);
	};

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);

		try {
			const payload = {
				seller: sellers.find((s) => s.id.toString() === data.sellerId)?.name,
				client: clients.find((c) => c.id.toString() === data.clientId)?.name,
				ofcType: ofcTypes.find((o) => o.id.toString() === data.ofcTypeId)?.name,
				products: data.products.map((p) => ({
					product: products.find((prod) => prod.id.toString() === p.productId)
						?.name,
					quantity: p.quantity,
					price: products.find((prod) => prod.id.toString() === p.productId)
						?.price,
				})),
				timestamp: new Date().toISOString(),
				requestId: `SR-${Date.now()}`,
			};

			console.log("Sending sample request to webhook:", WEBHOOK_URL, payload);

			const response = await fetch(WEBHOOK_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				mode: "no-cors",
				body: JSON.stringify({
					...payload,
					// Flatten the structure for easier N8N parsing
					sellerName: payload.seller,
					clientName: payload.client,
					ofcTypeName: payload.ofcType,
					productList: payload.products,
					submissionTimestamp: payload.timestamp,
					sampleRequestId: payload.requestId,
				}),
			});

			toast({
				title: "Request Sent Successfully",
				description:
					"Your sample request has been submitted to the automation system. Please check your N8N workflow to confirm processing.",
			});

			// Reset form
			form.reset();
			setProductSelections([{ productId: "", quantity: 1, price: 0 }]);
		} catch (error) {
			console.error("Error sending sample request:", error);
			toast({
				title: "Error",
				description:
					"Failed to send the sample request. Please check the webhook URL and try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
			<div className="max-w-2xl mx-auto flex flex-col gap-5">
				<Card className="shadow-elegant">
					<CardHeader className="text-center space-y-4">
						<CardTitle className="text-3xl font-bold bg-blue">
							Free of Charge Sample Request
						</CardTitle>
						<CardDescription className="text-lg">
							Request free samples for your clients to test products before
							purchase
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="sellerId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Seller Name</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select seller" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{sellers.map((seller) => (
															<SelectItem
																key={seller.id}
																value={seller.id.toString()}
															>
																{seller.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="clientId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Client Name</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select client" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{clients.map((client) => (
															<SelectItem
																key={client.id}
																value={client.id.toString()}
															>
																{client.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="ofcTypeId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>OFC Type</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select OFC type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{ofcTypes.map((ofcType) => (
														<SelectItem
															key={ofcType.id}
															value={ofcType.id.toString()}
														>
															{ofcType.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<FormLabel className="text-base font-semibold">
											Products & Quantities
										</FormLabel>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addProduct}
											className="flex items-center gap-2"
										>
											<Plus className="h-4 w-4" />
											Add Product
										</Button>
									</div>

									{productSelections.map((selection, index) => (
										<div
											key={index}
											className="flex gap-4 items-start p-4 border rounded-lg bg-muted/50"
										>
											<div className="flex-1">
												<Select
													value={selection.productId}
													onValueChange={(value) =>
														updateProduct(index, "productId", value)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select product" />
													</SelectTrigger>
													<SelectContent>
														{products.map((product) => (
															<SelectItem
																key={product.id}
																value={product.id.toString()}
															>
																{product.name} - EGP {product.price}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div className="w-24">
												<Input
													type="number"
													min="1"
													value={selection.quantity}
													onChange={(e) =>
														updateProduct(
															index,
															"quantity",
															parseInt(e.target.value) || 1
														)
													}
													placeholder="Qty"
												/>
											</div>
											{productSelections.length > 1 && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => removeProduct(index)}
													className="text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									))}
								</div>
								<Button
									type="submit"
									className="w-full h-12 text-lg font-semibold"
									disabled={isLoading}
								>
									{isLoading ? (
										"Sending Request..."
									) : (
										<>
											<Send className="mr-2 h-5 w-5" />
											Submit Sample Request
										</>
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
				<Button onClick={logout} variant="outline" size="sm">
					<LogOut className="w-4 h-4 mr-2" />
					Logout
				</Button>
			</div>
		</div>
	);
}
