<script lang="ts" setup>
import { format, sub } from "date-fns";
import type { Range } from "~/types";

definePageMeta({
  middleware: "is-admin",
});

const columns = [
  {
    key: "nick",
    label: "Nick",
    sortable: true,
  },
  {
    key: "name",
    label: "Usuario",
    sortable: true,
  },
  {
    key: "_count.Order",
    label: "Pedidos realizados",
    sortable: true,
  },
  {
    key: "lastConnection",
    label: "Última conexión",
    sortable: true,
  },
  {
    key: "actions",
  },
];

const router = useRouter();
const q = ref("");
const input = ref<{ input: HTMLInputElement }>();
const range = ref<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date(),
});

const query = computed(() => ({
  q: q.value,
  start: range.value.start.toISOString(),
  end: range.value.end.toISOString(),
}));

const { data, status } = await useFetch("/api/users", {
  query,
  default: () => [],
  lazy: true,
});

const formatDate = (date: string) => {
  return format(new Date(date), "dd/MM/yyyy HH:mm:ss");
};

const items = (row: any) => [
  [
    {
      label: "Ver",
      icon: "i-heroicons-eye-20-solid",
      click: () => router.push(`/admin/${row.id}`),
    },
  ],
];

defineShortcuts({
  "/": () => {
    input.value?.input?.focus();
  },
});
</script>
<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Admin">
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filtrar usuario..."
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <HomeDateRangePicker v-model="range" class="-ml-2.5" />
        </template>
      </UDashboardToolbar>
      <UDashboardPanelContent>
        <UTable
          :rows="data"
          :columns="columns"
          :loading="status === 'pending'"
          sort-mode="manual"
          class="w-full"
          :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }"
        >
          <template #nick-data="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar v-bind="row.avatar" :alt="row.nick" size="xs" />

              <span class="text-gray-900 dark:text-white font-medium">
                {{ row.nick }}
              </span>
            </div>
          </template>
          <template #price-data="{ row }">
            <span>${{ row.price }}</span>
          </template>
          <template #lastConnection-data="{ row }">
            <span>{{ formatDate(row.lastConnection) }}</span>
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
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
