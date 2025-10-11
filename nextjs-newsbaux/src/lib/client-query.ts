import { DataSource } from "@/db/schema";

export const getDataSources = async (origin: string): Promise<DataSource[]> => {
	const req = await fetch(`${origin}/api/data-sources`, {
		method: "GET"
	});
	return (await req.json()).data;

}
