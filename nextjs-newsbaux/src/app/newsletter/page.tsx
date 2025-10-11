import { auth, signIn } from "@/auth";
import { NewsletterEditor } from "@/components/custom/editor/newsletter-editor";
import { Button } from "@/components/ui/button";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Session } from "next-auth";
import { headers } from "next/headers";
import { getQueryClient } from "../get-query-client";
import { getDataSources } from "@/lib/client-query";


export default async function NewsletterPage() {
	const session: Session | null = await auth();
	const url = (await headers()).get('x-url') || "";
	const origin = url.split("/", 3).join("/");

	const queryClient = getQueryClient();
	queryClient.prefetchQuery({
		queryKey: ['dataSources'],
		queryFn: async () => await getDataSources(origin)
	});

	return (
		<div className="w-dvw min-h-dvh h-fit border flex flex-col py-20 items-center gap-10">
			<HydrationBoundary state={dehydrate(queryClient)}>
				<NewsletterEditor />
			</HydrationBoundary>
			<form action={async () => {
				"use server";
				await signIn("github");
			}}>
				<Button className="font-bold text-lg italic" type="submit">
					Create Newsletter
				</Button>
			</form>

		</div>
	);
}
