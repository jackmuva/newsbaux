import { Section, useEditorStore } from "@/store/editor-store";
import { useState } from "react";
import { DataSourceSelector } from "./data-source-selector";
import { DataSource } from "@/db/schema";
import { autosizeTextArea, handleAutosize } from "@/lib/utils";

export const SectionEditor = ({
	section,
	dataSources,
}: {
	section: Section,
	dataSources: DataSource[],
}) => {
	const [title, setTitle] = useState(section.title || "");
	const [systemPrompt, setSystemPrompt] = useState(section.systemPrompt || "");
	const { upsertSection }: { upsertSection: (section: Section) => void } = useEditorStore((state) => state);

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
			<div className={"px-8"}>
				<textarea
					value={title}
					onChange={handleTitleChange}
					onKeyDown={handleAutosize}
					placeholder="Section Title (i.e. Tech News)"
					rows={1}
					className="w-full text-4xl outline-none resize-none mb-4">
				</textarea>
				<textarea
					value={systemPrompt}
					onChange={handleSystemPromptChange}
					onKeyDown={handleAutosize}
					rows={4}
					placeholder={`what do you want to see from this section?
(i.e. News relevant for a senior level backend engineer. Interested in system design and local-first web apps.)`}
					className="w-full text-lg outline-none resize-none text-wrap">
				</textarea>
				<DataSourceSelector section={section} dataSources={dataSources} />
			</div>
		</div>
	);
}
