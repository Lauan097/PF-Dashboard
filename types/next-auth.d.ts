import { DefaultSession } from "next-auth";
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      provider?: string
      globalName?: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    provider?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    globalName?: string | null
    name?: string | null
    picture?: string | null
  }
}
