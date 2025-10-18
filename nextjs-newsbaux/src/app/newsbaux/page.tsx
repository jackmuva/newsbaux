// import { Session } from "next-auth";
// import { auth } from "@/auth";
import { TabNav } from "@/components/custom/tab-nav";

export default async function NewsbauxPage() {
	// const session: Session | null = await auth();
	return (
		<div className="w-full h-full pt-12">
			<TabNav />
			<div className="h-full bg-background w-full flex flex-col items-center gap-10 py-20">
			</div>
		</div>
	);

}
