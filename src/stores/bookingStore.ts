import { defineStore } from "pinia";
import apiClient from "@/api/api";
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import { useRoomStore } from "@/stores/roomStore";
import { API_ENDPOINTS } from "@/constants/api-constants";

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
        const url = API_ENDPOINTS.BOOKINGS.GET_ROOM_BOOKINGS_FOR_WEEK(
          roomStore.selectedRoom._id,
          format(selectedWeek, "yyyy-MM-dd")
        );
        const response = await apiClient.get(url);

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
