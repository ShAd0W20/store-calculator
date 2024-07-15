<script setup lang="ts">
const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const { data: sales } = await useFetch(`/api/orders/users/${props.userId}`, {
  lazy: true,
});

const formatNumber = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}).format;
</script>

<template>
  <UDashboardCard
    title="Ventas recientes"
    :description="`Has vendido ${sales?.length} productos en total`"
    icon="i-heroicons-chart-bar-20-solid"
  >
    <NuxtLink
      v-for="(sale, index) in sales?.slice(0, 4)"
      :key="index"
      class="px-3 py-2 -mx-2 last:-mb-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex items-center gap-3 relative"
    >
      <UAvatar v-bind="sale.client.image" :alt="sale.client.name" size="md" />

      <div class="text-sm flex-1">
        <div>
          <p class="text-gray-900 dark:text-white font-medium">
            {{ sale.client.name }}
          </p>
          <p class="text-gray-500 dark:text-gray-400">
            {{ sale.client.phone }}
          </p>
        </div>
      </div>

      <p class="text-gray-900 dark:text-white font-medium text-lg">
        {{ formatNumber(sale.total) }}
      </p>
    </NuxtLink>
  </UDashboardCard>
</template>
