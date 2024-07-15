<script setup lang="ts">
const workingStore = useMyWorkingStore();
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Calculadora">
        <template #right>
          <UButton
            v-if="!workingStore.isWorking"
            label="Fichar"
            trailing-icon="i-heroicons-clock-solid"
            variant="outline"
            @click="workingStore.startWorking()"
          />
          <UButton
            v-if="workingStore.isWorking"
            label="Salir de servicio"
            trailing-icon="i-heroicons-clock-solid"
            variant="outline"
            @click="workingStore.stopWorking()"
          />
        </template>
      </UDashboardNavbar>
      <div class="m-4">
        <CalculatorMain />
      </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>
