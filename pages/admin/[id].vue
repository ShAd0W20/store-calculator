<script setup lang="ts">
import type { User } from "@prisma/client";
import { formatDuration, sub } from "date-fns";
import { es } from "date-fns/locale";
import type { Period, Range } from "~/types";

definePageMeta({
  middleware: "is-admin",
});

const route = useRoute();
const router = useRouter();

const range = ref<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date(),
});
const period = ref<Period>("daily");
const user = ref<User | null>(null);

const { data: timeWorked, execute } = await useFetch(
  `/api/workTime/${route.params.id}`,
  {
    immediate: false,
  }
);

onBeforeMount(async () => {
  if (!route.params.id) {
    router.push("/admin");
  }

  await $fetch(`/api/users/${route.params.id}`, {
    onResponseError: (error) => {
      if (error.response.status === 404) {
        router.push("/admin");
      }
    },
    onResponse: (response) => {
      if (response.response.status === 200) {
        execute();
        user.value = response.response._data;
      }
    },
  });
});
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar :title="`Perfil - ${user?.nick ?? user?.name}`">
        <template #right>
          <span class="text-gray-400 text-sm">
            <span v-if="timeWorked">
              {{
                formatDuration(
                  {
                    hours: timeWorked.split(":")[0],
                    minutes: timeWorked.split(":")[1],
                    seconds: timeWorked.split(":")[2],
                  },
                  {
                    zero: false,
                    locale: es,
                  }
                )
              }}
            </span>
          </span>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <HomeDateRangePicker v-model="range" class="-ml-2.5" />
        </template>
      </UDashboardToolbar>

      <UDashboardPanelContent>
        <HomeChart
          :period="period"
          :range="range"
          :user-id="$route.params.id as string"
        />
        <div class="grid lg:grid-cols-2 lg:items-start gap-8 mt-8">
          <HomeSales :user-id="$route.params.id as string" />
        </div>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
