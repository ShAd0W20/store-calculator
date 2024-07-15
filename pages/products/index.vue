<script setup lang="ts">
import type { Product } from "@prisma/client";

const { data: authData } = useAuth();
const toast = useToast();

const defaultColumns = [
  {
    key: "name",
    label: "Nombre",
    sortable: true,
  },
  {
    key: "description",
    label: "Descripción",
  },
  {
    key: "price",
    label: "Precio",
    sortable: true,
  },
  {
    key: "actions",
  },
];

const items = (row: Product) => [
  [
    {
      label: "Editar",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => handleEditProduct(row),
    },
  ],
  [
    {
      label: "Eliminar",
      icon: "i-heroicons-trash-20-solid",
      click: () => handleDeleteProduct(row),
    },
  ],
];

const q = ref("");
const selectedColumns = ref(defaultColumns);
const input = ref<{ input: HTMLInputElement }>();
const sort = ref({ column: "id", direction: "asc" as const });
const isNewProductModalOpen = ref(false);
const isEditProductModalOpen = ref(false);
const selectedProduct = ref<Product | undefined>(undefined);

const columns = computed(() =>
  defaultColumns.filter((column) => selectedColumns.value.includes(column))
);

const query = computed(() => ({
  q: q.value,
  sort: sort.value.column,
  order: sort.value.direction,
}));

const {
  data: products,
  status,
  refresh,
} = await useFetch<Product[]>("/api/products", {
  query,
  default: () => [],
  lazy: true,
});

async function handleDeleteProduct(product: Product) {
  await $fetch(`/api/products/${product.id}`, {
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
          title: "Producto eliminado",
          timeout: 5000,
        });
        refresh();
      }
    },
  });
}

function handleEditProduct(product: Product) {
  selectedProduct.value = product;
  isEditProductModalOpen.value = true;
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
      <UDashboardNavbar title="Productos" :badge="products?.length">
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filtrar producto..."
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton
            v-if="authData?.user.role === 'admin'"
            label="Añadir producto"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="isNewProductModalOpen = true"
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
        v-model="isNewProductModalOpen"
        title="Nuevo producto"
        description="Añade un nuevo producto a tu tienda"
        :ui="{ width: 'sm:max-w-md' }"
      >
        <ProductsForm
          @close="
            isNewProductModalOpen = false;
            refresh();
          "
        />
      </UDashboardModal>
      <UDashboardModal
        v-model="isEditProductModalOpen"
        title="Editar producto"
        description="Edita un producto de tu tienda"
        :ui="{ width: 'sm:max-w-md' }"
      >
        <ProductsForm
          :product="selectedProduct"
          @close="
            isEditProductModalOpen = false;
            refresh();
          "
        />
      </UDashboardModal>
      <UTable
        v-model:sort="sort"
        :rows="products"
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
          <UDropdown :items="items(row)" v-if="authData?.user.role === 'admin'">
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
