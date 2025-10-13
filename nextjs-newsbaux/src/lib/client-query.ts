import { DataSource } from "@/db/schema";
import { Section } from "@/store/editor-store";

export const getStandardDataSources = async (origin: string): Promise<DataSource[]> => {
	const req = await fetch(`${origin}/api/data-sources/standard`, {
		method: "GET"
	});
	return (await req.json()).data;
}

export const getUserDataSources = async (origin: string): Promise<DataSource[]> => {
	const req = await fetch(`${origin}/api/data-sources`, {
		method: "GET"
	});
	return (await req.json()).data;
}

export const addNewDataSource = async (origin: string, url: string, dsName: string) => {
	const req = await fetch(`${origin}/api/data-sources`, {
		method: "POST",
		body: JSON.stringify({
			url: url,
			name: dsName,
			standard: false,
		}),
	});
	return await req.json();
}

export const createNewNewsletter = async (origin: string, cadence: string, name: string, sections: Section[]) => {
	const req = await fetch(`${origin}/api/newletter`, {
		method: "POST",
		body: JSON.stringify({
			cadence: cadence,
			name: name,
			sections: sections,
		}),
	});
	return await req.json();
}
