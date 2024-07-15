<script setup lang="ts">
const store = useMyWorkingStore();
onMounted(() => {
  window.onbeforeunload = (e) => {
    if (store.isWorking) {
      e.preventDefault();
      store.stopWorking();
    }
  };
});
</script>
<template>
  <div>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
    <UModals />
  </div>
</template>
