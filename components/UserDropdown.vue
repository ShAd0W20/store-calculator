<script setup lang="ts">
const { isDashboardSearchModalOpen } = useUIState();
const { metaSymbol } = useShortcuts();
const { data, signOut } = useAuth();

const router = useRouter();

const items = computed(() => [
  [
    {
      slot: "account",
      label: "",
      disabled: true,
    },
  ],
  [
    {
      label: "Perfil",
      icon: "i-heroicons-user",
      shortcuts: [metaSymbol.value, "P"],
      to: "/profile",
    },
    {
      label: "Comandos",
      icon: "i-heroicons-command-line",
      shortcuts: [metaSymbol.value, "K"],
      click: () => {
        isDashboardSearchModalOpen.value = true;
      },
    },
  ],
  [
    {
      label: "Cerrar sesión",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: () => handleSignOut(),
    },
  ],
]);

async function handleSignOut() {
  await signOut();
  await router.push("/auth/signIn");
}
</script>

<template>
  <UDropdown
    mode="hover"
    :items="items"
    :ui="{ width: 'w-full', item: { disabled: 'cursor-text select-text' } }"
    :popper="{ strategy: 'absolute', placement: 'top' }"
    class="w-full"
  >
    <template #default="{ open }">
      <UButton
        color="gray"
        variant="ghost"
        class="w-full"
        :label="data?.user?.nick ?? data?.user?.name"
        :class="[open && 'bg-gray-50 dark:bg-gray-800']"
      >
        <template #leading>
          <UAvatar :src="data?.user?.image" size="2xs" />
        </template>

        <template #trailing>
          <UIcon name="i-heroicons-ellipsis-vertical" class="w-5 h-5 ml-auto" />
        </template>
      </UButton>
    </template>

    <template #account>
      <div class="text-left">
        <p>
          Sesión iniciada como
        </p>
        <p class="truncate font-medium text-gray-900 dark:text-white">
          {{ data?.user?.email }}
        </p>
      </div>
    </template>
  </UDropdown>
</template>
