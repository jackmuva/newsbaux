import { getQueryClient } from "@/app/get-query-client";
import { Button } from "@/components/ui/button";
import { DataSource } from "@/db/schema";
import { addNewDataSource } from "@/lib/client-queries";
import { Section, useEditorStore } from "@/store/editor-store";
import { useMutation } from "@tanstack/react-query";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Dialog, DialogClose, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { ContextMenu, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ContextMenuContent } from "@radix-ui/react-context-menu";

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

	const validateInputs = (urlString: string, dsName: string): boolean => {
		try {
			const url: URL = new URL(urlString);
			if (url.protocol !== "http:" && url.protocol !== "https:") {
				toast("not a valid url");
				return false;
			}
			if (!dsName) {
				toast("source requires a name");
				return false;
			}
		} catch (_) {
			toast("not a valid url");
			return false;
		}
		return true;
	}

	const queryClient = getQueryClient();
	const mutation = useMutation({
		mutationFn: async () => {
			if (validateInputs(url, dsName)) await addNewDataSource(window.location.origin, url, dsName);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['userSources'] })
		},
		onError: () => {
			toast('unable to add source');
		},
	});

	return (
		<div className="w-full h-60 bg-input/10 content-start
			grid grid-cols-5 gap-4 p-2 overflow-y-auto">
			{dataSources.map((ds: DataSource) => {
				return (
					<ContextMenu key={ds.id}>
						<ContextMenuTrigger>
							<div key={ds.id} id={ds.id}
								className={`flex h-16 justify-center gap-1
						items-center p-2 cursor-pointer border-input/30 
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
								<img className="rounded-sm mb-1"
									width={20}
									height={20}
									alt={ds.name} src={
										ds.id === "yc" ? "/yc.webp" :
											ds.id === "tr" ? "/tr.png" :
												ds.id === "bwj" ? "/bwj.jpg" :
													"https://www.google.com/s2/favicons?domain=" + ds.url
									} />
								<p className="text-sm text-center line-clamp-2">
									{ds.name}
								</p>
							</div>
						</ContextMenuTrigger>
						<ContextMenuContent className="bg-popover">
							<ContextMenuItem className="p-0">
								<Button variant={"destructive"} size={"sm"}>
									Delete
								</Button>
							</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				);
			})}
			<Dialog>
				<DialogTrigger asChild>
					<div className="h-16 flex gap-1 justify-center
						items-center p-2 cursor-pointer 						
						border-input/30 bg-input/20
						border-2 border-b-6 active:border-b-2 hover:border-b-4 
						hover:translate-y-0.5 active:translate-y-1">
						<CirclePlus className="h-5 w-5" />
						<p className="text-sm text-center line-clamp-2">
							Add Source
						</p>
					</div>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Add Source
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-2">
						<input type="url"
							placeholder="https://example.com"
							pattern="https://.*"
							className="placeholder-gray-400 w-full p-1 outline"
							onChange={(e) => {
								e.preventDefault();
								setUrl(e.target.value);
							}}

						/>
						<input placeholder="give your source a name"
							className="placeholder-gray-400 w-full p-1 outline"
							onChange={(e) => {
								e.preventDefault();
								setDsName(e.target.value);
							}}
						/>
						<DialogFooter className="h-10">
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button onClick={() => mutation.mutate()}>
								Add
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</div >
	);
}
