"use server";
import { Album, FilePenLine, PackageOpen, SquareLibrary } from "lucide-react";
import { headers } from "next/headers";

export const TabNav = async () => {
	const url = (await headers()).get('x-url') || "";
	const origin = url.split("/", 3).join("/");
	const path = url.split("/").pop();

	const tabs = ["newsbaux", "editor", "quick-start", "blaug"];

	const styleArray = [
		"bg-background h-full text-xl",
		"bg-background h-10 text-lg brightness-90",
		"bg-background h-9 text-base brightness-75",
		"bg-background h-8 text-sm brightness-50"
	];

	let start = 0;
	if (path === "editor") {
		start = 1;
	} else if (path === "quick-start") {
		start = 2;
	} else if (path === "blaug") {
		start = 3;
	}

	const reindex = (i: number): number => {
		return i - start < 0 ? (i - start) * -1 : i - start;
	}

	return (
		<div className="w-full h-12 bg-transparent absolute top-0
			flex items-end">
			{tabs.map((tab, i) => {
				return (
					<a key={tab} href={origin + "/" + tab}
						className={`gap-1 cursor-pointer px-4 italic
								font-bold hover:brightness-100
								flex border items-center 
								${styleArray[reindex(i)]}`}>
						{i === 0 ? <PackageOpen size={25 - (reindex(i) * 3)} />
							: i === 1 ? <FilePenLine size={25 - (reindex(i) * 3)} />
								: i === 2 ? <Album size={25 - (reindex(i) * 3)} />
									: <SquareLibrary size={25 - (reindex(i) * 3)} />}
						<label className="cursor-pointer">{tab}</label>
					</a>

				);
			})}
		</div >
	);
}
