import { defineStore } from "pinia";
import { Room } from "@/types/room";
import apiClient from "@/api/api";
import { Equipements } from "@/types/equipements";
import { API_ENDPOINTS } from "@/constants/api-constants";

export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [] as Room[],
    equipements: [] as Equipements[],
    loading: false,
    error: null as string | null,
    selectedRoom: null as Room | null,
    filteredRooms: [] as Room[],
    selectedCapacity: 5,
    selectedEquipments: [] as string[],
    noRoomsFound: false,
  }),

  actions: {
    async fetchRooms() {
      this.loading = true;
      try {
        const response = await apiClient.get<Room[]>(
          API_ENDPOINTS.ROOMS.GET_ALL
        );
        this.rooms = response.data;

        // Filtrer les salles
        this.filterRooms();

        // Sélectionner la première salle disponible
        if (this.filteredRooms.length > 0) {
          this.selectedRoom = this.filteredRooms[0];
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Une erreur est survenue";
      } finally {
        this.loading = false;
      }
    },
    selectRoom(roomId: string) {
      const room = this.rooms.find((r) => r._id === roomId);
      if (room) {
        this.selectedRoom = room;
      } else {
        console.warn("Salle non trouvée :", roomId);
      }
    },

    filterRooms() {
      const filteredRooms = this.rooms;

      this.filteredRooms = filteredRooms;

      // On conserve la salle sélectionnée si elle est toujours dans les salles filtrées
      if (this.filteredRooms.some((r) => r._id === this.selectedRoom?._id)) {
        return;
      }

      // Sinon, sélectionner la première salle filtrée (ou null si aucune salle)
      this.selectedRoom =
        this.filteredRooms.length > 0 ? this.filteredRooms[0] : null;
    },
    setSelectedCapacity(capacity: number) {
      this.selectedCapacity = capacity;
    },

    async fetchEquipments() {
      this.loading = true;
      try {
        const response = await apiClient.get<Equipements[]>(
          API_ENDPOINTS.EQUIPMENTS.GET_ALL
        );
        this.equipements = response.data;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des équipements";
      } finally {
        this.loading = false;
      }
    },

    addEquipment(equipmentName: string) {
      if (!this.selectedEquipments.includes(equipmentName)) {
        this.selectedEquipments.push(equipmentName);
        this.filterRooms();
      }
    },

    // méthode pour supprimer un équipement
    removeEquipment(equipmentName: string) {
      this.selectedEquipments = this.selectedEquipments.filter(
        (equip) => equip !== equipmentName
      );
      this.filterRooms();
    },

    // Méthode pour clear tous les équipements
    clearEquipments() {
      this.selectedEquipments = [];
      this.filterRooms();
    },
  },
});
