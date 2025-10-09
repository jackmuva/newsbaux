"use client";
import { Section, useEditorStore } from "@/store/editor-store"
import { SectionEditor } from "./section-editor";
import { useEffect, useState } from "react";
import { PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const NewsletterEditor = () => {
	const {
		sections,
		addSection,
	}: {
		sections: Section[],
		addSection: () => void,
	} = useEditorStore((state) => state);

	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			}
		},
	}))

	useEffect(() => {
		if (sections.length === 0) {
			addSection();
		}
	}, [sections]);

	return (
		<QueryClientProvider client={queryClient}>
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
		</QueryClientProvider>
	);
}
