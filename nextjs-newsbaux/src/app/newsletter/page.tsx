import { auth, signIn } from "@/auth";
import { NewsletterEditor } from "@/components/custom/editor/newsletter-editor";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";

export default async function NewsletterPage() {
	const session: Session | null = await auth();

	return (
		<div className="w-dvw min-h-dvh h-fit border flex flex-col py-20 items-center gap-10">
			<NewsletterEditor />
			<form action={async () => {
				"use server";
				await signIn("github");
			}}>
				<Button className="font-bold text-lg italic" type="submit">Create Newsletter</Button>
			</form>

		</div>
	);
}
