import { getStandardDataSources } from "@/db/queries/dataSources";
import { DataSource } from "@/db/schema";

export async function GET() {
	try {
		let dataSources: DataSource[] = [];
		dataSources = [...dataSources, ...(await getStandardDataSources())];
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
