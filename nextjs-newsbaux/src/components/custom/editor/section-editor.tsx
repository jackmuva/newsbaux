import { Section, useEditorStore } from "@/store/editor-store";
import { useEffect, useRef } from "react";

export const SectionEditor = ({
	section
}: {
	section: Section
}) => {
	const titleRef = useRef<HTMLTextAreaElement>(null);
	const descRef = useRef<HTMLTextAreaElement>(null);
	const { upsertSection }: { upsertSection: (section: Section) => void } = useEditorStore((state) => state);

	useEffect(() => {
		const autosize = (element: HTMLTextAreaElement) => {
			setTimeout(() => {
				element.style.cssText = 'height:auto; padding:0';
				element.style.cssText = 'height:' + element.scrollHeight + 'px';
			}, 0);
		};

		const updateSection = (element: HTMLTextAreaElement, isTitle: boolean) => {
			if (isTitle) {
				upsertSection({
					...section,
					title: element.value,
				} as Section)
			} else {
				upsertSection({
					...section,
					systemPrompt: element.value,
				} as Section)

			}

		}

		const handleTitleKeydown = () => titleRef.current && autosize(titleRef.current);
		const handleDescKeydown = () => descRef.current && autosize(descRef.current);
		const handleTitleChanges = () => titleRef.current && updateSection(titleRef.current, true);
		const handleDescChanges = () => descRef.current && updateSection(descRef.current, false);

		titleRef.current?.addEventListener('keydown', handleTitleKeydown);
		descRef.current?.addEventListener('keydown', handleDescKeydown);
		titleRef.current?.addEventListener('input', handleTitleChanges);
		descRef.current?.addEventListener('input', handleDescChanges);

		return () => {
			titleRef.current?.removeEventListener('keydown', handleTitleKeydown);
			descRef.current?.removeEventListener('keydown', handleDescKeydown);
			titleRef.current?.removeEventListener('input', handleTitleChanges);
			descRef.current?.removeEventListener('input', handleDescChanges);
		};
	}, []);

	return (
		<div className="w-[900px] flex flex-col items-center p-2 gap-4 border-b-2 border-secondary/50 pb-10 mb-10">
			<textarea ref={titleRef} placeholder="Section Title (i.e. Tech News)"
				rows={1}
				className="w-full p-0 text-5xl outline-none resize-none">
			</textarea>
			<textarea ref={descRef} rows={7}
				placeholder={`what do you want to see from this section?
(i.e. News relevant for a senior level backend engineer. Interested in system design and local-first web apps.)`}
				className="p-0 w-full text-lg outline-none resize-none text-wrap">
			</textarea>
		</div>
	);
}
