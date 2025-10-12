import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { DataSource } from "@/db/schema";
import { Section, useEditorStore } from "@/store/editor-store";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const DataSourceSelector = ({
	dataSources,
	section,
}: {
	dataSources: DataSource[],
	section: Section,
}) => {
	const { upsertSection } = useEditorStore((state) => state);
	const [url, setUrl] = useState("");
	const [dsName, setDsName] = useState("");

	const dsMap = section.dataSources.reduce((obj, ds) => ({ ...obj, [ds.id]: ds }), {})

	const addDataSource = (dataSource: DataSource) => {
		upsertSection({
			...section,
			dataSources: [...section.dataSources, dataSource],
		} as Section)
	}

	const removeDataSource = (dataSource: DataSource) => {
		upsertSection({
			...section,
			dataSources: section.dataSources.filter((ds) => ds.id !== dataSource.id),
		} as Section)
	}

	const addNewDataSource = async () => {
		const req = await fetch(`${window.location.origin}/api/data-sources`, {
			method: "POST",
			body: JSON.stringify({
				url: url,
				name: dsName,
				standard: false,
			}),
		});
		const res = await req.json();
		if (res.ok) {

		} else {
			console.log('hi');
			toast('unable to add source');
		}
	}

	return (
		<div className="w-full h-60 bg-input/10 
			grid grid-cols-7 gap-4 p-2 ">
			{dataSources.map((ds: DataSource) => {
				return (
					<div key={ds.id} className={`h-fit flex flex-col 
						items-center justify-between p-2 cursor-pointer border-input/30 
						${!(ds.id in dsMap) ? `bg-input/20
						border-2 border-b-6 active:border-b-2 hover:border-b-4 
						hover:translate-y-0.5 active:translate-y-1` :
							`bg-secondary/70 border-2 translate-y-1`}`}
						onClick={() => {
							if (ds.id in dsMap) {
								removeDataSource(ds);
							} else {
								addDataSource(ds)
							}
						}}>
						<img className="h-16 w-16 rounded-sm"
							alt={ds.name} src={
								ds.id === "yc" ? "/yc.webp" :
									ds.id === "tr" ? "/tr.png" :
										ds.id === "bwj" ? "/bwj.jpg" :
											"/custom.jpg"
							} />
						<p className="text-sm text-center line-clamp-1">
							{ds.name}
						</p>
					</div>
				);
			})}
			<Popover>
				<PopoverTrigger asChild>
					<div className="h-fit flex flex-col 
						items-center justify-between p-2 cursor-pointer 						
						border-input/30 bg-input/20
						border-2 border-b-6 active:border-b-2 hover:border-b-4 
						hover:translate-y-0.5 active:translate-y-1">
						<div className="h-16 w-16 flex justify-center items-center p-2">
							<CirclePlus className="h-full w-full" />
						</div>
						<p className="text-sm text-center line-clamp-1">
							Add Source
						</p>
					</div>
				</PopoverTrigger>
				<PopoverContent className="h-30 w-80 border border-input/50 bg-input/30 
					px-2 py-4 translate-y-2 border-b-8 ">
					<div className="flex gap-2 items-center h-10">
						<input type="url"
							placeholder="https://example.com"
							pattern="https://.*"
							className="w-full p-1 outline"
							onChange={(e) => {
								e.preventDefault();
								setUrl(e.target.value);
							}}

						/>
					</div>
					<div className="flex gap-2 items-center h-10">
						<input placeholder="give your source a name"
							className="w-full p-1 outline"
							onChange={(e) => {
								e.preventDefault();
								setDsName(e.target.value);
							}}
						/>
						<Button className="text-sm"
							onClick={() => addNewDataSource()}>
							Add
						</Button>
					</div>
				</PopoverContent>
			</Popover>
			<Toaster position="top-center" />
		</div>
	);
}
