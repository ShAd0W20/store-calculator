<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
});

const { data } = await useFetch("/api/config");

const { signIn } = useAuth();
</script>

<template>
  <div class="w-full flex items-center justify-center">
    <UCard class="max-w-sm w-full">
      <UAuthForm
        title="Entrar al sistema"
        :description="`Debes ser empleado del ${data?.config.storeName} para poder acceder a esta aplicación.`"
        align="bottom"
        icon="i-heroicons-lock-closed"
        :ui="{ base: 'text-center', footer: 'text-center' }"
        :providers="[
          {
            label: 'Continua con Discord',
            icon: 'i-simple-icons-discord',
            color: 'white',
            click: () => signIn('discord'),
          },
        ]"
      />
    </UCard>
  </div>
</template>
