<script setup lang="ts">
import type { DashboardSidebarLink } from "@nuxt/ui-pro/types";

const { data: authData } = useAuth();
const { data, status } = await useFetch("/api/config");

const links: Ref<DashboardSidebarLink[]> = ref([
  {
    label: "Calculadora",
    icon: "i-heroicons-calculator",
    to: "/",
    tooltip: {
      text: "Calculadora",
      shortcuts: ["G", "H"],
    },
  },
  {
    label: "Productos",
    icon: "i-heroicons-cube",
    to: "/products",
    tooltip: {
      text: "Productos",
      shortcuts: ["G", "P"],
    },
  },
  {
    label: "Clientes",
    icon: "i-heroicons-user-group",
    to: "/clients",
    tooltip: {
      text: "Clientes",
      shortcuts: ["G", "L"],
    },
  },
]);

const groups = [
  {
    key: "links",
    label: "Ir a...",
    commands: links.value.map((link) => ({
      ...link,
      shortcuts: link.tooltip?.shortcuts,
    })),
  },
];

onMounted(() => {
  if (authData.value?.user.role === "admin") {
    links.value.push({
      label: "Admin",
      icon: "i-heroicons-cog",
      to: "/admin",
      tooltip: {
        text: "Admin",
        shortcuts: ["G", "A"],
      },
    });
  }
});
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel
      :width="250"
      :resizable="{ min: 200, max: 300 }"
      collapsible
    >
      <UDashboardNavbar class="!border-transparent" :ui="{ left: 'flex-1' }">
        <template #left>
          <img
            v-if="status === 'success' && data"
            :src="data.config.storeLogo!"
            :alt="data.config.storeName"
            class="h-8 rounded-md"
          />
          <h3 class="ml-2 text-lg font-semibold">
            {{ data?.config.storeName }}
          </h3>
        </template>
      </UDashboardNavbar>

      <UDashboardSidebar>
        <template #header>
          <UDashboardSearchButton v-if="authData" label="Buscar..." />
        </template>

        <UDashboardSidebarLinks v-if="authData" :links="links" />

        <div class="flex-1" />

        <UDivider class="sticky bottom-0" />

        <template #footer>
          <UserDropdown v-if="authData" />
          <UButton
            v-else
            class="w-full"
            variant="outline"
            label="Iniciar sesión"
            trailing-icon="i-heroicons-arrow-right"
            to="/auth/signIn"
          />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <ClientOnly>
      <LazyUDashboardSearch placeholder="Buscar..." :groups="groups" />
    </ClientOnly>
  </UDashboardLayout>
</template>
