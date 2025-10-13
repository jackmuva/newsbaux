"use client";
import { Section, useEditorStore } from "@/store/editor-store"
import { SectionEditor } from "./section-editor";
import { useEffect, useRef, useState } from "react";
import { PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createNewNewsletter, getStandardDataSources, getUserDataSources } from "@/lib/client-query";
import { Session } from "next-auth";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, DialogFooter, DialogHeader } from "@/components/ui/dialog";

export const NewsletterEditor = ({
	session,
}: {
	session: Session | null,
}) => {
	const newsTitleRef = useRef<HTMLTextAreaElement>(null);
	const {
		sections,
		addSection,
	}: {
		sections: Section[],
		addSection: () => void,
	} = useEditorStore((state) => state);

	const [cadence, setCadence] = useState<string>("");
	const [name, setName] = useState<string>("");

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
		const res = await createNewNewsletter(window.location.origin, cadence, name, sections);
		if (res.ok) {
			toast("Newsletter created");
		} else {
			toast("Failed to create newsletter");
		}
	}

	useEffect(() => {
		const autosize = (element: HTMLTextAreaElement) => {
			setTimeout(() => {
				element.style.cssText = 'height:auto; padding:0';
				element.style.cssText = 'height:' + element.scrollHeight + 'px';
			}, 0);
		};

		const handleTitleKeydown = () => newsTitleRef.current && autosize(newsTitleRef.current);

		newsTitleRef.current?.addEventListener('keydown', handleTitleKeydown);

		return () => {
			newsTitleRef.current?.removeEventListener('keydown', handleTitleKeydown);
		};
	}, []);


	return (
		<>
			{sections.length > 0 && <>
				<div className="flex flex-col items-center relative">
					<textarea ref={newsTitleRef} placeholder="Your Newsletter Title"
						rows={1}
						className="w-full text-5xl outline-none resize-none"
						onChange={(e) => {
							e.preventDefault();
							setName(e.target.value);
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
								Create Newsletter
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									Delivery
								</DialogTitle>
							</DialogHeader>
							<select className="text-gray-400 outline p-1"
								onChange={(e) => {
									e.preventDefault();
									setCadence(e.target.value);
								}}>
								<option value="">new edition every x days</option>
								{[...Array(7).keys()].map((num) => {
									return (<option key={num} value={num + 1}>
										{num + 1}
									</option>)
								})}
							</select>
							<DialogFooter className="h-10">
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button>
									Save changes
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>}
				<Toaster />
			</>}
		</>
	);
}
