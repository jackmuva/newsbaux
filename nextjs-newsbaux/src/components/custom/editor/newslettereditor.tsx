"use client";
import { Section, useEditorStore } from "@/store/editor-store"
import { SectionEditor } from "./section-editor";
import { useEffect } from "react";
import { PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getStandardDataSources, getUserDataSources } from "@/lib/client-query";

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

	const { data: standardSources } = useSuspenseQuery({
		queryKey: ['standardSources'],
		queryFn: async () => await getStandardDataSources(window.location.origin),
	});

	const { data: userSources } = useQuery({
		queryKey: ['userSources'],
		queryFn: async () => await getUserDataSources(window.location.origin),
	});

	return (
		<div className="flex flex-col items-center relative">
			{sections.map((section: Section) => {
				return <SectionEditor key={section.id} section={section} dataSources={[...standardSources, ...userSources ?? []]} />
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
