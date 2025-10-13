"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme()

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			toastOptions={{
				unstyled: true,
				classNames: {
					toast: `bg-foreground text-background p-2 text-center rounded-none
						italic shadow-2xl`,
				},
			}}

			{...props}
		/>
	)
}

export { Toaster }
