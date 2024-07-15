<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";
import { z } from "zod";

const toast = useToast();
const workStore = useMyWorkingStore();

const { data: products, status: productStatus } = await useFetch(
  "/api/products",
  {
    lazy: true,
  }
);

const {
  data: clients,
  status,
  refresh,
} = await useFetch("/api/clients", {
  lazy: true,
});

const isClientModalOpen = ref(false);

const schema = z.object({
  clientId: z.string().cuid(),
  products: z.array(
    z.object({
      product: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
        image: z.string().optional(),
      }),
      quantity: z
        .number({
          message: "Quantity is required",
        })
        .min(1, { message: "Quantity must be greater than 0" })
        .max(100, { message: "Quantity must be less than 100" }),
    })
  ),
});

type Schema = z.infer<typeof schema>;

const state = reactive({
  clientId: undefined,
  products: [
    {
      product: {
        id: undefined,
        name: undefined,
        description: undefined,
        price: undefined,
        image: undefined,
      },
      quantity: undefined,
    },
  ],
});
const form = ref();

function addProduct() {
  state.products.push({
    product: {
      id: undefined,
      name: undefined,
      description: undefined,
      price: undefined,
      image: undefined,
    },
    quantity: undefined,
  });
}

function removeProduct(index: number) {
  state.products.splice(index, 1);
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!workStore.isWorking) {
    toast.add({
      title: "Error",
      description: "Tienes que estar de servicio para facturar",
      icon: "i-heroicons-x-mark-20-solid",
      color: "red",
    });
    return;
  }

  form.value.clear();
  await $fetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(event.data),
    onResponse: (res) => {
      if (res.response.status === 201) {
        handleClearForm();
        toast.add({
          title: "Facturado",
          description: "La factura ha sido creada con éxito",
          icon: "i-heroicons-check-20-solid",
          color: "primary",
        });
      }
    },
    onResponseError: (error) => {
      toast.add({
        title: "Error",
        description: "Hay campos vacíos o incorrectos",
        icon: "i-heroicons-x-mark-20-solid",
        color: "red",
      });
    },
  });
}

function handleClearForm() {
  state.clientId = undefined;
  state.products = [
    {
      product: {
        id: undefined,
        name: undefined,
        description: undefined,
        price: undefined,
        image: undefined,
      },
      quantity: undefined,
    },
  ];
}
</script>

<template>
  <UAlert
    v-if="!workStore.isWorking"
    icon="i-heroicons-exclamation-triangle-20-solid"
    color="primary"
    variant="outline"
    title="Atención"
    description="No estás de servicio, debes estar de servicio para facturar"
    class="mb-4"
  />
  <UForm ref="form" :state="state" @submit="onSubmit" class="space-y-4">
    <UInputMenu
      v-model="state.clientId"
      placeholder="Busca un cliente"
      :options="clients"
      :loading="status === 'pending'"
      option-attribute="name"
      value-attribute="id"
    />
    <div
      v-for="(_product, index) in state.products"
      :key="index"
      class="flex flex-row gap-4"
    >
      <UFormGroup :name="`quantity${index}`">
        <UInput
          v-model="state.products[index].quantity"
          type="number"
          placeholder="Cantidad"
        />
      </UFormGroup>
      <UFormGroup :name="`product${index}`">
        <UInputMenu
          placeholder="Selecciona un producto"
          v-model="state.products[index].product"
          :options="products"
          :loading="productStatus === 'pending'"
          option-attribute="name"
        />
      </UFormGroup>
      <UInput
        :model-value="
          state.products[index].product.price *
            state.products[index].quantity || 0
        "
        disabled
        placeholder="Precio"
      >
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">$</span>
        </template></UInput
      >
      <UButton
        @click="addProduct"
        icon="i-heroicons-plus-circle"
        variant="ghost"
        :ui="{ rounded: 'rounded-full' }"
        :disabled="!workStore.isWorking"
      />
      <UButton
        v-if="index > 0"
        @click="() => removeProduct(index)"
        icon="i-heroicons-x-mark-20-solid"
        variant="ghost"
        :ui="{ rounded: 'rounded-full' }"
      />
    </div>

    <div>
      Total ${{
        state.products.reduce(
          (acc, product) =>
            acc + product.product?.price * product?.quantity || 0,
          0
        )
      }}
    </div>

    <div class="flex flex-row items-center justify-between">
      <UButton
        label="Añadir cliente"
        variant="outline"
        icon="i-heroicons-plus-circle"
        :disabled="!workStore.isWorking"
        @click="() => (isClientModalOpen = true)"
      />
      <div class="flex flex-row gap-4">
        <UButton
          type="submit"
          label="Facturar"
          variant="outline"
          icon="i-heroicons-check-20-solid"
          :disabled="!workStore.isWorking"
        />
        <UButton
          label="Limpiar"
          variant="outline"
          icon="i-heroicons-trash-20-solid"
          :disabled="!workStore.isWorking"
          @click="() => handleClearForm()"
        />
      </div>
    </div>
  </UForm>

  <UDashboardModal
    v-model="isClientModalOpen"
    title="Nuevo cliente"
    description="Registra un nuevo cliente"
    :ui="{ width: 'sm:max-w-md' }"
  >
    <ClientsForm
      @close="
        isClientModalOpen = false;
        refresh();
      "
    />
  </UDashboardModal>
</template>
