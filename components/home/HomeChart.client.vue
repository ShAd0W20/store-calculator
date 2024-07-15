<script setup lang="ts">
import {
  VisArea,
  VisAxis,
  VisCrosshair,
  VisLine,
  VisTooltip,
  VisXYContainer,
} from "@unovis/vue";
import { format, formatDuration } from "date-fns";
import { es } from "date-fns/locale";
import type { Period, Range } from "~/types";

const cardRef = ref<HTMLElement | null>(null);

const props = defineProps({
  period: {
    type: String as PropType<Period>,
    required: true,
  },
  range: {
    type: Object as PropType<Range>,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

type DataRecord = {
  work_date: Date;
  total_work_time: string;
  total_work_time_seconds: number;
};

const { data } = await useAsyncData<DataRecord[]>(
  "chart",
  () =>
    $fetch(`/api/workTime/${props.userId}`, {
      method: "POST",
      body: {
        start: props.range.start,
        end: props.range.end,
      },
    }),
  {
    watch: [() => props.range],
    default: () => [],
  }
);

const x = (_: DataRecord, i: number) => i;
const y = (d: DataRecord) => d.total_work_time_seconds / 3600;

const total = computed(() => {
  return data.value?.reduce(
    (acc, d) => acc + d.total_work_time_seconds / 3600,
    0
  );
});

const formatDate = (date: Date): string => {
  return {
    daily: format(date, "d MMM"),
    weekly: format(date, "d MMM"),
    monthly: format(date, "MMM yyy"),
  }[props.period];
};

const xTicks = (i: number) => {
  if (i === 0 || !data.value || !data.value[i]) {
    return "";
  }

  return formatDate(data.value[i].work_date);
};

const template = (d: DataRecord) =>
  `${formatDate(d.work_date)}: ${d.total_work_time} horas`;
</script>

<template>
  <UDashboardCard
    ref="cardRef"
    :ui="{ body: { padding: '!pb-3 !px-0' } as any }"
  >
    <template #header>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
          Tiempo trabajado
        </p>
        <p class="text-3xl text-gray-900 dark:text-white font-semibold">
          {{
            formatDuration(
              {
                hours: Math.floor(total),
                minutes: Math.floor((total % 1) * 60),
              },
              {
                locale: es,
              }
            )
          }}
        </p>
      </div>
    </template>

    <VisXYContainer :data="data">
      <VisLine
        :fallbackValue="0"
        :x="x"
        :y="y"
        color="rgb(var(--color-primary-DEFAULT))"
      />
      <VisArea
        :x="x"
        :y="y"
        color="rgb(var(--color-primary-DEFAULT))"
        :opacity="0.1"
      />

      <VisAxis type="x" :x="x" :tick-format="xTicks" />

      <VisCrosshair
        color="rgb(var(--color-primary-DEFAULT))"
        :template="template"
      />

      <VisTooltip />
    </VisXYContainer>
  </UDashboardCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: rgb(var(--color-primary-500));
  --vis-crosshair-circle-stroke-color: #fff;

  --vis-axis-grid-color: rgb(var(--color-gray-200));
  --vis-axis-tick-color: rgb(var(--color-gray-200));
  --vis-axis-tick-label-color: rgb(var(--color-gray-400));

  --vis-tooltip-background-color: #fff;
  --vis-tooltip-border-color: rgb(var(--color-gray-200));
  --vis-tooltip-text-color: rgb(var(--color-gray-900));
}

.dark {
  .unovis-xy-container {
    --vis-crosshair-line-stroke-color: rgb(var(--color-primary-400));
    --vis-crosshair-circle-stroke-color: rgb(var(--color-gray-900));

    --vis-axis-grid-color: rgb(var(--color-gray-800));
    --vis-axis-tick-color: rgb(var(--color-gray-800));
    --vis-axis-tick-label-color: rgb(var(--color-gray-500));

    --vis-tooltip-background-color: rgb(var(--color-gray-900));
    --vis-tooltip-border-color: rgb(var(--color-gray-800));
    --vis-tooltip-text-color: #fff;
  }
}
</style>
