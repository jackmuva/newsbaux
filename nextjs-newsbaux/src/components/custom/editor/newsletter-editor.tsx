"use client";
import { Section, useEditorStore } from "@/store/editor-store"
import { SectionEditor } from "./section-editor";
import { useEffect, useState } from "react";
import { PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createNewNewsletter, getNewsletters, getStandardDataSources, getUserDataSources } from "@/lib/client-queries";
import { Session } from "next-auth";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogHeader
} from "@/components/ui/dialog";
import { autosizeTextArea, handleAutosize } from "@/lib/utils";

export const NewsletterEditor = ({
	session,
}: {
	session: Session | null,
}) => {
	const {
		sections,
		addSection,
		setSections,
	}: {
		sections: Section[],
		addSection: () => void,
		setSections: (sections: Section[]) => void,
	} = useEditorStore((state) => state);

	const [cadence, setCadence] = useState<string>("");
	const [name, setName] = useState<string>("");
	const [sendTime, setSendTime] = useState<number>(7);


	const { data: standardSources } = useSuspenseQuery({
		queryKey: ['standardSources'],
		queryFn: async () => await getStandardDataSources(window.location.origin),
	});

	const { data: userSources } = useQuery({
		queryKey: ['userSources'],
		queryFn: async () => await getUserDataSources(window.location.origin),
	});

	const { data: newsletters, isLoading: isNewsLoading } = useQuery({
		queryKey: ['newsletters'],
		queryFn: async () => await getNewsletters(window.location.origin),
	});

	useEffect(() => {
		if (newsletters) {
			setSections(newsletters.sections);
			if (newsletters.newsletter.length > 0) {
				setName(newsletters.newsletter[0].name);
				setCadence(String(newsletters.newsletter[0].cadence));
			}
		}

	}, [newsletters, setSections]);

	useEffect(() => {
		if (sections.length === 0) {
			addSection();
		}

	}, [newsletters, addSection, sections.length]);

	const validateSections = (): boolean => {
		for (const section of sections) {
			if (!section.title || !section.systemPrompt) {
				toast("Section titles and descriptions cannot be blank");
				return false;
			}
		}
		if (!name || !cadence) {
			toast("Newsletter name and cadence cannot be blank");
			return false;
		}
		return true;
	}

	const createNewsletter = async () => {
		const res = await createNewNewsletter(window.location.origin, cadence, name, sections,
			new Date(new Date().setHours(sendTime, 0, 0, 0)).getUTCHours(),
			newsletters?.newsletter[0].id);
		if (res.status === 200) {
			toast("Newsletter published");
		} else {
			toast("Failed to create newsletter");
		}
	}

	const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setName(e.target.value);
		autosizeTextArea(e.target);
	};

	return (
		<>
			{sections.length > 0 && !isNewsLoading && <>
				<div className="animate-in fade-in duration-500 flex flex-col items-center relative">
					<textarea placeholder="Your Newsletter Title"
						value={name}
						rows={1}
						className="w-full text-5xl outline-none resize-none
							overflow-hidden"
						onKeyDown={(e) => handleAutosize(e)}
						onChange={(e) => {
							e.preventDefault();
							handleTitleChange(e);
						}}>
					</textarea>
					{sections.map((section: Section) => {
						return <SectionEditor key={section.id}
							section={section}
							dataSources={[...standardSources, ...userSources ?? []]} />
					})}
					<Button variant={"outline"}
						className="text-lg absolute flex items-center gap-1 -bottom-2.5"
						onClick={() => addSection()}>
						<PenLineIcon size={20} />
						<p>Add Section</p>
					</Button>
				</div>
				{session &&
					<Dialog>
						<DialogTrigger asChild>
							<Button className="font-bold text-lg italic">
								Publish Newsletter
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									Delivery
								</DialogTitle>
							</DialogHeader>
							<select className="text-gray-400 outline p-1"
								value={cadence}
								onChange={(e) => {
									e.preventDefault();
									setCadence(e.target.value);
								}}>
								<option value="">new edition every x days</option>
								{[...Array(7).keys()].map((num) => {
									return (<option key={num} value={num + 1}>
										every {num + 1} day(s)
									</option>)
								})}
							</select>
							<select className="text-gray-400 outline p-1"
								value={sendTime}
								onChange={(e) => {
									e.preventDefault();
									setSendTime(Number(e.target.value));
								}}>
								<option value="">at x o' clock</option>
								{[...Array(24).keys()].map((num) => {
									return (<option key={num} value={num + 1}>
										at {num + 1} o' clock
									</option>)
								})}
							</select>
							<DialogFooter className="h-10">
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button onClick={() => {
									if (validateSections()) createNewsletter()
								}}>
									Publish
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>}
				<Toaster position="top-center" />
			</>}
		</>
	);
}
