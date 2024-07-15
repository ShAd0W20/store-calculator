<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import type { Product } from "@prisma/client";

const props = defineProps<{
  product?: Product;
}>();

const emit = defineEmits(["close"]);
const toast = useToast();

const schema = z.object({
  name: z.string({
    required_error: "Introduzca un nombre",
  }),
  description: z.string().optional(),
  price: z.number({
    required_error: "Introduzca un precio",
  }),
  image: z
    .string()
    .url({
      message: "Introduzca una URL válida",
    })
    .optional(),
});

type Schema = z.infer<typeof schema>;

const form = reactive({
  name: props.product?.name ?? undefined,
  description: props.product?.description ?? undefined,
  price: props.product?.price ?? undefined,
  image: props.product?.image ?? undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (props.product !== undefined) {
    await $fetch(`/api/products/${props.product.id}`, {
      method: "PUT",
      body: JSON.stringify(event.data),
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
        if (res.response.status === 200) {
          toast.add({
            icon: "i-heroicons-check-circle",
            color: "green",
            title: "Producto actualizado",
            timeout: 5000,
          });
          emit("close");
        }
      },
    });
  } else {
    await $fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(event.data),
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
        if (res.response.status === 201) {
          toast.add({
            icon: "i-heroicons-check-circle",
            color: "green",
            title: "Producto creado",
            timeout: 5000,
          });
          emit("close");
        }
      },
    });
  }
}
</script>

<template>
  <UForm :schema="schema" :state="form" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Nombre" name="name">
      <UInput v-model="form.name" />
    </UFormGroup>
    <UFormGroup label="Descripción" name="description">
      <UTextarea v-model="form.description" />
    </UFormGroup>
    <UFormGroup label="Precio" name="price">
      <UInput v-model="form.price" type="number" />
    </UFormGroup>
    <UFormGroup label="Imagen" name="image">
      <UInput v-model="form.image" />
    </UFormGroup>
    <div class="flex justify-end gap-3">
      <UButton
        label="Cancelar"
        color="gray"
        variant="ghost"
        icon="i-heroicons-x-mark-20-solid"
        @click="emit('close')"
      />
      <UButton
        type="submit"
        label="Guardar"
        variant="outline"
        icon="i-heroicons-check-20-solid"
      />
    </div>
  </UForm>
</template>
