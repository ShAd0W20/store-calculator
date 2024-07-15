<script setup lang="ts">
const { data: authData } = useAuth();
import { formatDuration, sub } from "date-fns";
import { es } from "date-fns/locale";
import type { Period, Range } from "~/types";

const range = ref<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date(),
});
const period = ref<Period>("daily");

const { data: timeWorked } = await useFetch(
  `/api/workTime/${authData.value?.user.id}`,
  {
    lazy: true,
  }
);
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar
        :title="`Perfil - ${authData?.user.nick ?? authData?.user.name}`"
      >
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
          :user-id="authData?.user.id"
        />
        <div class="grid lg:grid-cols-2 lg:items-start gap-8 mt-8">
          <HomeSales :user-id="authData?.user.id" />
        </div>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
