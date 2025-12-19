import { Section, useEditorStore } from "@/store/editor-store";
import { useState } from "react";
import { DataSourceSelector } from "./data-source-selector";
import { DataSource } from "@/db/schema";
import { autosizeTextArea, handleAutosize } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const SectionEditor = ({
	section,
	dataSources,
}: {
	section: Section,
	dataSources: DataSource[],
}) => {
	const [title, setTitle] = useState(section.title || "");
	const [systemPrompt, setSystemPrompt] = useState(section.systemPrompt || "");
	const {
		upsertSection,
		removeSection,
	}: {
		upsertSection: (section: Section) => void,
		removeSection: (section: Section) => void
	} = useEditorStore((state) => state);

	const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setTitle(e.target.value);
		autosizeTextArea(e.target);
		upsertSection({
			...section,
			title: e.target.value,
		} as Section);
	};

	const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setSystemPrompt(e.target.value);
		autosizeTextArea(e.target);
		upsertSection({
			...section,
			systemPrompt: e.target.value,
		} as Section);
	};

	return (
		<div className="w-[950px] flex flex-col items-center p-2 border-b-2 border-secondary/50 mb-2 py-8">
			<div className="px-8 flex flex-col gap-4">
				<div className="flex gap-2 justify-between">
					<textarea
						value={title}
						onChange={handleTitleChange}
						onKeyDown={handleAutosize}
						placeholder="Section Title (i.e. Tech News)"
						rows={1}
						className="w-full text-4xl outline-none resize-none 
					overflow-hidden">
					</textarea>
					<Button variant={"destructive"}
						size={"sm"}
						className="h-fit py-1"
						onClick={() => removeSection(section)}>
						Remove
					</Button>
				</div>
				<textarea
					value={systemPrompt}
					onChange={handleSystemPromptChange}
					onKeyDown={handleAutosize}
					rows={4}
					placeholder={`What should Newsbaux's news reporter agent look for?
(i.e. News relevant for a senior level backend engineer. Interested in system design and local-first web apps.)`}
					className="w-full text-lg outline-none resize-none text-wrap 
					overflow-hidden">
				</textarea>
				<DataSourceSelector section={section} dataSources={dataSources} />
			</div>
		</div>
	);
}
