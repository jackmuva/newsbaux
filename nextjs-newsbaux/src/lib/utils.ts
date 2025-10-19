import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const autosizeTextArea = (element: HTMLTextAreaElement) => {
	setTimeout(() => {
		element.style.cssText = 'height:auto; padding:0';
		element.style.cssText = 'height:' + element.scrollHeight + 'px';
	}, 0);
};

export const handleAutosize = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
	autosizeTextArea(e.currentTarget);
};

export const addDays = (date: Date, days: number): Date => {
	var date = new Date(date);
	date.setDate(date.getDate() + days);
	return date;
}

