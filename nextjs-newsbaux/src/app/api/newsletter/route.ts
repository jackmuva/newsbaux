import { auth } from "@/auth";
import * as z from "zod";
import { Session } from 'next-auth';
import { createNewsletter } from "@/db/queries/newsletters";
import { createNewsSection } from "@/db/queries/newsSections";

export const NewsletterZod = z.object({
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
			email: z.string(),
			id: z.string(),
		})),
	})),
});

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
	console.log(body);
	const nz = NewsletterZod.parse({ ...body, email: session.user.email });
	try {
		const newsletter = await createNewsletter(nz.email, nz.cadence, nz.name);

		if (!newsletter) return Response.json({
			status: 500,
			message: "unable to create newsletter",
		});
		for (const section of nz.sections) {
			await createNewsSection(nz.email, newsletter.id, section.title, section.systemPrompt, section.dataSources);
		}
		return Response.json({
			status: 200,
			data: newsletter,
		});
	} catch (e) {
		return Response.json({
			status: 500,
			message: e
		});
	}
}
