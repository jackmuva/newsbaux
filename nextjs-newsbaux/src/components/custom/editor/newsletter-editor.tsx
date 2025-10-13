"use client";
import { Section, useEditorStore } from "@/store/editor-store"
import { SectionEditor } from "./section-editor";
import { useEffect } from "react";
import { PenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getStandardDataSources, getUserDataSources } from "@/lib/client-query";
import { Session } from "next-auth";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";

export const NewsletterEditor = ({
	session,
}: {
	session: Session | null,
}) => {
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

	const validateSections = (): boolean => {
		for (const section of sections) {
			if (!section.title || !section.systemPrompt) {
				toast("Section titles and descriptions cannot be blank")
				return false;
			}
		}
		return true;
	}

	return (
		<>
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
								Create Newsletter

							</DialogTitle>
						</DialogHeader>
						<input placeholder="give your newsletter a name"
							className="w-full p-1 outline" />
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button>Save changes</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>}
			<Toaster />
		</>
	);
}
