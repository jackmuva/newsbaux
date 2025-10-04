import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";

export default async function NewsletterPage() {
	const session: Session | null = await auth();
	console.log(session);

	return (
		<div className="w-dvw h-dvh flex flex-col pt-20 items-center">
			<form action={async () => {
				"use server";
				await signIn("github");
			}}>
				<Button type="submit">Create</Button>
			</form>

		</div>
	);
}
