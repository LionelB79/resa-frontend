import { defineStore } from "pinia";
import { Room } from "@/types/room";
import apiClient from "@/api/api";

export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [] as Room[],
    loading: false,
    error: null as string | null,
    selectedRoom: null as Room | null,
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
    selectRoom(roomId: string) {
      const room = this.rooms.find((r) => r.id === roomId);
      if (room) {
        this.selectedRoom = room;
      } else {
        console.warn("Salle non trouvée :", roomId);
      }
    },
  },
});
