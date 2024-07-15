<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import type { Client } from "@prisma/client";

const props = defineProps<{
  client?: Client;
}>();

const emit = defineEmits(["close"]);
const toast = useToast();

const schema = z.object({
  name: z
    .string({
      required_error: "Introduzca un nombre",
    })
    .min(3, {
      message: "El nombre debe tener al menos 3 caracteres",
    })
    .regex(/^[a-zA-ZÀ-ÿ0-9_\s]+$/, {
      message: "El nombre solo puede contener letras y números",
    }),
  phone: z
    .string({
      required_error: "Ingrese un teléfono",
    })
    .optional(),
  image: z
    .string()
    .url({
      message: "Introduzca una URL válida",
    })
    .optional(),
});

type Schema = z.infer<typeof schema>;

const form = reactive({
  name: props.client?.name ?? undefined,
  phone: props.client?.phone ?? undefined,
  image: props.client?.image ?? undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (props.client !== undefined) {
    await $fetch(`/api/clients/${props.client.id}`, {
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
        res.response.status === 200 && emit("close");
      },
    });
  } else {
    await $fetch("/api/clients", {
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
          emit("close");
          toast.add({
            icon: "i-heroicons-check-circle",
            color: "green",
            title: "Éxito",
            description: "Cliente creado exitosamente",
            timeout: 5000,
          });
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
    <UFormGroup label="Teléfono" name="phone">
      <UInput v-model="form.phone" />
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
