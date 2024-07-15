<script setup lang="ts">
import type { Client } from "@prisma/client";

const { data: authData } = useAuth();
const toast = useToast();

const defaultColumns = [
  {
    key: "name",
    label: "Nombre",
    sortable: true,
  },
  {
    key: "phone",
    label: "Teléfono",
  },
  {
    key: "actions",
  },
];

const items = (row: Client) => [
  [
    {
      label: "Editar",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => handleEditClient(row),
    },
  ],
  authData?.value?.user.role === "admin" && [
    {
      label: "Eliminar",
      icon: "i-heroicons-trash-20-solid",
      click: () => handleDeleteClient(row),
    },
  ],
];

const q = ref("");
const selectedColumns = ref(defaultColumns);
const input = ref<{ input: HTMLInputElement }>();
const sort = ref({ column: "id", direction: "asc" as const });
const isNewClientModalOpen = ref(false);
const isEditClientModalOpen = ref(false);
const selectedClient = ref<Client | undefined>(undefined);

const columns = computed(() =>
  defaultColumns.filter((column) => selectedColumns.value.includes(column))
);

const query = computed(() => ({
  q: q.value,
  sort: sort.value.column,
  order: sort.value.direction,
}));

const {
  data: clients,
  status,
  refresh,
} = await useFetch<Client[]>("/api/clients", {
  query,
  default: () => [],
  lazy: true,
});

async function handleDeleteClient(client: Client) {
  await $fetch(`/api/clients/${client.id}`, {
    method: "DELETE",
    onResponseError: (error) => {
      toast.add({
        icon: "i-heroicons-exclamation-circle",
        color: "red",
        title: "Error",
        description: error.response.statusText,
        timeout: 5000,
      });
    },
    onResponse: (res) => {
      if (res.response.status === 204) {
        toast.add({
          icon: "i-heroicons-check-circle",
          color: "green",
          title: "Cliente eliminado",
          timeout: 5000,
        });
        refresh();
      }
    },
  });
}

function handleEditClient(client: Client) {
  selectedClient.value = client;
  isEditClientModalOpen.value = true;
}

defineShortcuts({
  "/": () => {
    input.value?.input?.focus();
  },
});
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Clientes" :badge="clients?.length">
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filtrar cliente..."
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton
            label="Añadir cliente"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="isNewClientModalOpen = true"
          />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #right>
          <USelectMenu
            v-model="selectedColumns"
            icon="i-heroicons-adjustments-horizontal-solid"
            :options="defaultColumns"
            multiple
            class="hidden lg:block"
          >
            <template #label> Mostrar </template>
          </USelectMenu>
        </template>
      </UDashboardToolbar>
      <UDashboardModal
        v-model="isNewClientModalOpen"
        title="Nuevo cliente"
        description="Registra un nuevo cliente"
        :ui="{ width: 'sm:max-w-md' }"
      >
        <ClientsForm
          @close="
            isNewClientModalOpen = false;
            refresh();
          "
        />
      </UDashboardModal>
      <UDashboardModal
        v-model="isEditClientModalOpen"
        title="Editar Cliente"
        description="Edita los datos de un cliente"
        :ui="{ width: 'sm:max-w-md' }"
      >
        <ClientsForm
          :client="selectedClient"
          @close="
            isEditClientModalOpen = false;
            refresh();
          "
        />
      </UDashboardModal>
      <UTable
        v-model:sort="sort"
        :rows="clients"
        :columns="columns"
        :loading="status === 'pending'"
        sort-mode="manual"
        class="w-full"
        :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
      >
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar v-bind="row.avatar" :alt="row.name" size="xs" />

            <span class="text-gray-900 dark:text-white font-medium">{{
              row.name
            }}</span>
          </div>
        </template>
        <template #price-data="{ row }">
          <span>${{ row.price }}</span>
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </template>
      </UTable>
    </UDashboardPanel>
  </UDashboardPage>
</template>
