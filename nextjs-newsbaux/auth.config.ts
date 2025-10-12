import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"
import { createUser, getUserByEmail } from "@/db/queries/users"

export default {
	providers: [GitHub],
	callbacks: {
		async signIn(session) {
			if (session.user.email) {
				const existingUser = await getUserByEmail(session.user.email)

				if (!existingUser) {
					await createUser(
						session.user.name || "Unknown User",
						session.user.email,
						session.user.image || ""
					)
				}
			}
			return true
		}
	}
} satisfies NextAuthConfig
