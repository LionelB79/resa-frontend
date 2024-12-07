import { defineStore } from "pinia";
import apiClient from "@/api/api";
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import { useRoomStore } from "@/stores/roomStore";

export const useBookingStore = defineStore("bookings", {
  state: () => ({
    slots: [] as Booking[],
  }),

  actions: {
    async fetchBookings(selectedWeek: Date) {
      const roomStore = useRoomStore();

      // Vérification qu'une room est selectionnée
      if (!roomStore.selectedRoom) {
        console.warn("Aucune salle sélectionnée");
        this.slots = [];
        return;
      }

      try {
        const response = await apiClient.get(
          `/booking/room/${roomStore.selectedRoom._id}/week?weekStart=${format(
            selectedWeek,
            "yyyy-MM-dd"
          )}`
        );

        // On attribue les bookings au slots
        this.slots = response.data;
        console.log("Réservations récupérées:", this.slots);
      } catch (error) {
        console.error("Erreur lors de la récupération des réservations", error);
        this.slots = [];
      }
    },
  },

  getters: {
    getSlots(): Booking[] {
      return this.slots;
    },
  },
});
