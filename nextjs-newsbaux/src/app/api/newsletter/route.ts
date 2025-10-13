import { auth } from "@/auth";
import * as z from "zod";
import { Session } from 'next-auth';
import { createNewsletter, getNewslettersByUserId, updateNewsletter } from "@/db/queries/newsletters";
import { createNewsSection, getNewsSectionsByNewsletterId, upsertNewsSection } from "@/db/queries/newsSections";
import { Newsletter, NewsSection } from "@/db/schema";
import { Section } from "@/store/editor-store";

export const NewsletterZod = z.object({
	id: z.string().nullable(),
	email: z.string(),
	cadence: z.number(),
	name: z.string(),
	sections: z.array(z.object({
		id: z.string(),
		newsId: z.optional(z.string()),
		title: z.string(),
		systemPrompt: z.string(),
		dataSources: z.array(z.object({
			url: z.string(),
			name: z.string(),
			standard: z.boolean(),
			email: z.string().nullable(),
			id: z.string(),
		})),
	})),
});

export async function GET() {
	const session: Session | null = await auth();

	if (!session) {
		console.error("unable to get session");
		return Response.json({
			status: 400,
			message: "not authenticated",
		});
	}
	if (!session.user || !session.user.email) {
		console.error("unable to get user");
		return Response.json({
			status: 500,
			message: "unable to get user session",
		});
	}

	try {
		const newsletters: Newsletter[] = await getNewslettersByUserId(session.user.email);
		let sections: NewsSection[] = [];
		if (newsletters.length > 0) {
			sections = await getNewsSectionsByNewsletterId(newsletters[0].id)
		}
		const reformattedSections: NewsSection[] = [];
		for (const section of sections) {
			if (!section.dataSources) {
				reformattedSections.push({ ...section, dataSources: [] });
			} else {
				reformattedSections.push({ ...section });
			}
		}
		return Response.json({
			status: 200,
			data: {
				newsletter: newsletters,
				sections: reformattedSections,
			},
		});
	} catch (e) {
		console.error("unable to get newsletters: ", e);
		return Response.json({
			status: 500,
			message: e
		});
	}
}

export async function POST(request: Request) {
	const session: Session | null = await auth();

	if (!session) return Response.json({
		status: 400,
		message: "not authenticated",
	});
	if (!session.user) return Response.json({
		status: 500,
		message: "unable to get user session",
	});

	const body = await request.json();
	try {
		const nz = NewsletterZod.parse({ ...body, email: session.user.email });
		const existing: boolean = (await getNewslettersByUserId(nz.email)).length > 0;
		let newsletter: Newsletter | null = null;
		if (!existing) {
			newsletter = await createNewsletter(nz.email, nz.cadence, nz.name);
		} else if (nz.id) {
			newsletter = await updateNewsletter(nz.id, nz.cadence, nz.name);
		}
		if (!newsletter) return Response.json({
			status: 500,
			message: "unable to create newsletter",
		});
		for (const section of nz.sections) {
			await upsertNewsSection(section.id, nz.email, newsletter.id, section.title, section.systemPrompt, section.dataSources);
		}
		return Response.json({
			status: 200,
			data: newsletter,
		});
	} catch (e) {
		console.error("data body: ", body);
		console.error("error: ", e);
		return Response.json({
			status: 500,
			message: e,
		});
	}
}
