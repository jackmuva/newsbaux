import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const libreBask = Libre_Baskerville({
	weight: "400",
	variable: "--font-libre",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "newbaux",
	description: "Personalized Newsletter, Curated by You",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} ${libreBask.variable} antialiased
				w-dvw h-dvh bg-transparent border-r border-b-8 border-foreground/50 font-libre`}>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}
