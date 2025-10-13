import { Session } from "next-auth";
import { auth } from "@/auth";
import { TabNav } from "@/components/custom/tab-nav";

export default async function QuickStartPage() {
	const session: Session | null = await auth();

	return (
		<div className="bg-background w-full border min-h-dvh flex flex-col pt-30 pb-20 items-center gap-10">
			<TabNav />
		</div>
	);
}
