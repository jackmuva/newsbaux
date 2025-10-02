import { signIn, auth } from "@/auth"
import { Session } from "next-auth";

export default async function Home() {
	const session: Session | null = await auth();
	console.log(session);

	return (
		<div>
			<form action={async () => {
				"use server";
				await signIn("github");
			}}>
				<button type="submit">Create</button>
			</form>

		</div>
	);
}
