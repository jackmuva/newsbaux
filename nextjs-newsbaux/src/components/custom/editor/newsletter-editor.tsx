"use client";
import { Section, useEditorStore } from "@/store/editor-store"
import { SectionEditor } from "./section-editor";
import { useEffect } from "react";

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

	return (
		<div>
			{sections.map((section: Section) => {
				return <SectionEditor key={section.id} section={section} />
			})}
		</div>
	);
}
