import { defineStore } from "pinia";

export const useMyWorkingStore = defineStore('myWorkingStore', {
  state: () => ({
    isWorking: false,
  }),
  persist: true,
  actions: {
    async startWorking() {
      await $fetch("/api/workTime", {
        method: "POST",
        onResponse: () => {
          this.isWorking = true;
        },
        onRequestError: () => {
          this.isWorking = false;
        },
      });
    },
    async stopWorking() {
      await $fetch("/api/workTime", {
        method: "POST",
        onResponse: () => {
          this.isWorking = false;
        },
        onRequestError: () => {
          this.isWorking = false;
        },
      });
    },
  },
});
