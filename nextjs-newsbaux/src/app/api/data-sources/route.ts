import { getStandardDataSources } from "@/db/queries/dataSources";

export async function GET(request: Request) {
	try {
		const dataSources = await getStandardDataSources();
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
