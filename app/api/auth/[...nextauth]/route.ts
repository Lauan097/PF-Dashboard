import NextAuth, { AuthOptions } from "next-auth";
import DiscordProvider, { DiscordProfile } from "next-auth/providers/discord";

export const runtime = "nodejs";

const isProd = process.env.NODE_ENV === "production";

// Se o usuário já logou no site principal (pflegacy.xyz), o cookie compartilhado
// em .pflegacy.xyz é lido automaticamente aqui. Caso contrário, o login pode ser
// feito diretamente pelo dashboard via Discord OAuth.
export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: isProd
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: isProd ? ".pflegacy.xyz" : undefined,
      },
    },
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      if (user) {
        token.id = user.id;
      }

      if (account?.provider === "discord" && profile) {
        const discordProfile = profile as DiscordProfile;
        token.globalName = discordProfile.global_name ?? null;
        token.name =
          discordProfile.global_name || discordProfile.username || token.name;
        token.email = discordProfile.email;

        if (discordProfile.avatar) {
          token.picture = `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`;
        }
      }

      // Token ainda válido — retorna sem renovar
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Tenta renovar o access token via refresh token
      if (token.refreshToken && token.provider === "discord") {
        try {
          const response = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.DISCORD_CLIENT_ID!,
              client_secret: process.env.DISCORD_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          });

          if (response.ok) {
            const newTokens = await response.json();
            token.accessToken = newTokens.access_token;
            token.refreshToken = newTokens.refresh_token ?? token.refreshToken;
            token.expiresAt = Math.floor(Date.now() / 1000) + newTokens.expires_in;
          }
        } catch (error) {
          console.error("Erro ao renovar token:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.globalName = token.globalName as string;
      }
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };