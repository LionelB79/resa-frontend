import { defineStore } from "pinia";
import { Room } from "@/types/room";
import apiClient from "@/api/api";

export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [] as Room[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchRooms() {
      this.loading = true;
      try {
        const response = await apiClient.get<Room[]>("/rooms");
        this.rooms = response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Une erreur est survenue";
      } finally {
        this.loading = false;
      }
    },
  },
});
