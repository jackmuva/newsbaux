import { Session } from "next-auth";
import { auth } from "@/auth";
import { TabNav } from "@/components/custom/tab-nav";

export default async function NewsbauxPage() {
	const session: Session | null = await auth();

	return (
		<div className="w-full min-h-dvh flex flex-col pt-30 pb-20 items-center gap-10">
			<TabNav />
			<div className="h-full bg-background w-full flex flex-col items-center gap-10 py-20">
			</div>
		</div>
	);
}
