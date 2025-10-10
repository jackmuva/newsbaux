"use client";
import { Section, useEditorStore } from "@/store/editor-store"
import { SectionEditor } from "./section-editor";
import { useEffect } from "react";
import { PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";

export const NewsletterEditor = () => {
	const {
		sections,
		addSection,
	}: {
		sections: Section[],
		addSection: () => void,
	} = useEditorStore((state) => state);

	useEffect(() => {
		if (sections.length === 0) {
			addSection();
		}
	}, [sections]);

	const { data: dataSources } = useSuspenseQuery({
		queryKey: ['dataSources'],
		queryFn: async () => {
			const req = await fetch(`${origin}/api/data-sources`, {
				method: "GET"
			});
			return await req.json();
		},
	});
	console.log(dataSources);

	return (
		<div className="flex flex-col items-center relative">
			{sections.map((section: Section) => {
				return <SectionEditor key={section.id} section={section} />
			})}
			<Button variant={"outline"}
				className="text-lg absolute flex items-center gap-1 -bottom-2.5"
				onClick={() => addSection()}>
				<PenLineIcon size={20} />
				<p>Add Section</p>
			</Button>
		</div>
	);
}
