import { defineStore } from "pinia";
import { Room } from "@/types/room";
import apiClient from "@/api/api";

export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [] as Room[],
    loading: false,
    error: null as string | null,
    selectedRoom: null as Room | null,
    selectedEquipment: null as string | null, // Équipement sélectionné
    filteredRooms: [] as Room[], // Salles filtrées
  }),

  actions: {
    async fetchRooms() {
      this.loading = true;
      try {
        const response = await apiClient.get<Room[]>("/rooms");
        this.rooms = response.data;
        console.log("this.rooms", this.rooms);
        // Initialiser filteredRooms avec toutes les salles dès le chargement
        this.filteredRooms = this.rooms;
        // On sélectionne la première salle par défaut
        if (this.rooms.length > 0) {
          this.selectedRoom = this.rooms[0];
        }
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
    // Filtrer les salles par équipement
    filterRoomsByEquipment(equipmentName: string | null) {
      // Si aucun équipement n'est sélectionné, on affiche toutes les salles
      if (!equipmentName) {
        this.filteredRooms = this.rooms;
        this.selectedEquipment = null;
      } else {
        // Filtrer les salles
        this.filteredRooms = this.rooms.filter((room) =>
          room.equipements.some((equip) => equip.name === equipmentName)
        );
        this.selectedEquipment = equipmentName;
      }

      // Ne pas modifier la salle sélectionnée
      // La salle reste sélectionnée même si elle n'est pas dans les salles filtrées
    },
  },
});
