// file: ~/server/api/auth/[...].ts
import { NuxtAuthHandler } from "#auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import DiscordProvider from "next-auth/providers/discord";

const config = useRuntimeConfig();

export default NuxtAuthHandler({
  secret: config.NUXT_SECRET,
  adapter: PrismaAdapter(prisma) as any,
  pages: {
    signIn: "/auth/signIn",
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    DiscordProvider.default({
      clientId: config.DISCORD_CLIENT_ID,
      clientSecret: config.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Get in which servers the user is in
      const guilds = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${account?.access_token}`,
        },
      }).then((res) => res.json());

      // Check if the user is in the guild
      const isMember = guilds.some(
        (guild: any) => guild.id === config.DISCORD_GUILD_ID
      );

      if (!isMember) {
        return false;
      }

      // get the user's permissions
      const member = await fetch(
        `https://discord.com/api/users/@me/guilds/${config.DISCORD_GUILD_ID}/member`,
        {
          headers: {
            Authorization: `Bearer ${account?.access_token}`,
          },
        }
      ).then((res) => res.json());

      // assign the user's role
      user = {
        ...user,
        role: member.roles.includes(config.DISCORD_ADMIN_ROLE_ID)
          ? "admin"
          : "user",
        nick: member.nick,
      };

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          email: profile?.email,
          image: profile?.image,
          role: user.role,
          nick: user.nick,
        },
      });

      return true;
    },
    session({ session, user }) {
      session.user = {
        ...user,
        role: user.role,
        nick: user.nick,
      };
      return session;
    },
  },
});
