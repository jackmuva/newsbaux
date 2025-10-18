import { auth } from "@/auth";
import { createDataSource, deleteDataSourceById, getDataSourcesByUser } from "@/db/queries/dataSources";
import { DataSource } from "@/db/schema";
import * as z from "zod";
import { Session } from 'next-auth';

export async function GET() {
	try {
		let dataSources: DataSource[] = [];
		const session: Session | null = await auth();
		if (session && session.user && session.user.email) {
			dataSources = [...dataSources, ...(await getDataSourcesByUser(session.user.email))];
		}
		return Response.json({
			status: 200,
			data: dataSources,
		});
	} catch (e) {
		return Response.json({
			status: 500,
			message: e
		});
	}
}

export const DataSourceZod = z.object({
	id: z.string().nullable(),
	email: z.string(),
	url: z.string(),
	name: z.string(),
	standard: z.boolean(),
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
	const ds = DataSourceZod.parse({ ...body, email: session.user.email });
	try {
		const dataSource = await createDataSource(ds.url, ds.email, ds.name, ds.standard);
		return Response.json({
			status: 200,
			data: dataSource,
		});
	} catch (e) {
		return Response.json({
			status: 500,
			message: e
		});
	}
}

export async function DELETE(request: Request) {
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
	const ds = DataSourceZod.parse({ ...body, email: session.user.email });
	try {
		if (ds.id) await deleteDataSourceById(ds.id);
		return Response.json({
			status: 200,
			message: "successfully deleted",
		});
	} catch (e) {
		return Response.json({
			status: 500,
			message: e
		});
	}
}
