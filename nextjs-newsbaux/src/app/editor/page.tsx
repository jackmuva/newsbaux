import { auth, signIn } from "@/auth";
import { NewsletterEditor } from "@/components/custom/editor/newsletter-editor";
import { Button } from "@/components/ui/button";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Session } from "next-auth";
import { headers } from "next/headers";
import { getQueryClient } from "../get-query-client";
import { getStandardDataSources } from "@/lib/client-queries";
import { TabNav } from "@/components/custom/tab-nav";


export default async function EditorPage() {
	const session: Session | null = await auth();
	const url = (await headers()).get('x-url') || "";
	const origin = url.split("/", 3).join("/");

	const queryClient = getQueryClient();
	queryClient.prefetchQuery({
		queryKey: ['standardSources'],
		queryFn: async () => await getStandardDataSources(origin)
	});

	return (
		<div className="w-full min-h-dvh pt-12">
			<TabNav />
			<div className="border min-h-dvh bg-background w-full flex flex-col items-center gap-10 py-20">
				<HydrationBoundary state={dehydrate(queryClient)}>
					<NewsletterEditor session={session} />
				</HydrationBoundary>
				{!session && <form action={async () => {
					"use server";
					await signIn("github");
				}}>
					<Button className="font-bold text-lg italic" type="submit">
						Create Newsletter
					</Button>
				</form>}
			</div>
		</div>
	);
}
