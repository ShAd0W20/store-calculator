// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ["@nuxt/ui-pro"],
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@sidebase/nuxt-auth",
    "@vueuse/nuxt",
  ],
  runtimeConfig: {
    NUXT_SECRET: process.env.NUXT_SECRET,
    AUTH_ORIGIN: process.env.AUTH_ORIGIN,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
    DISCORD_ADMIN_ROLE_ID: process.env.DISCORD_ADMIN_ROLE_ID,
  },
  auth: {
    globalAppMiddleware: true,
    provider: {
      type: "authjs",
    },
  },
  ui: {
    icons: ["heroicons", "simple-icons"],
  },
  future: {
    compatibilityVersion: 4,
  },
});
