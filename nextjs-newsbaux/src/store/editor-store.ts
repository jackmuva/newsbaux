import { DataSource } from '@/db/schema'
import { v4 } from 'uuid'
import { create } from 'zustand'

export type Section = {
	id: string,
	title: string,
	systemPrompt: string,
	dataSources: DataSource[],
}

export type EditorState = {
	sections: Section[],
	upsertSection: (section: Section) => void,
	addSection: () => void,
	setSections: (sections: Section[]) => void,
	removeSection: (section: Section) => void,
}

export const useEditorStore = create<EditorState>((set, get, store) => ({
	sections: [],

	upsertSection: (section: Section) => {
		const newSections: Section[] = [];
		const oldSections: Section[] = [...get().sections];
		let pushed = false;
		for (const sect of oldSections) {
			if (sect.id !== section.id) {
				newSections.push(sect);
			} else {
				pushed = true;
				newSections.push(section);
			}
		}
		if (!pushed) newSections.push(section);
		set({ sections: newSections });
	},

	removeSection: (section: Section) => {
		set({ sections: [...get().sections.filter((sec) => sec.id !== section.id)] });
	},

	addSection: () => {
		set({
			sections: [...get().sections, {
				id: v4(),
				title: "",
				systemPrompt: "",
				dataSources: [],
			}]
		});
	},

	setSections: (sections: Section[]) => set({ sections: sections }),
}))
