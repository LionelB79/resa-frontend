import { defineStore } from "pinia";
import { Room } from "@/types/room";
import apiClient from "@/api/api";
import { Equipements } from "@/types/equipements";

export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [] as Room[],
    equipements: [] as Equipements[],
    loading: false,
    error: null as string | null,
    selectedRoom: null as Room | null,
    filteredRooms: [] as Room[],
    selectedCapacity: 5,

    selectedEquipment: null as string | null, // Équipement sélectionné
  }),

  actions: {
    async fetchRooms() {
      this.loading = true;
      try {
        const response = await apiClient.get<Room[]>("/rooms");
        this.rooms = response.data;

        // Initialiser et filtrer les salles dès le chargement
        this.filterRooms();

        // On sélectionne la première salle par défaut
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
      const room = this.rooms.find((r) => r.id === roomId);
      if (room) {
        this.selectedRoom = room;
      } else {
        console.warn("Salle non trouvée :", roomId);
      }
    },
    // Filtrer les salles selon l'équipement et la capacité
    filterRooms() {
      let filteredRooms = this.rooms;
      console.log("Selected Equipment:", this.selectedEquipment);

      // Filtrage par équipement
      if (this.selectedEquipment) {
        filteredRooms = filteredRooms.filter((room) =>
          room.equipements.some(
            (equip) => equip.name === this.selectedEquipment
          )
        );
      }

      // Filtrage par capacité
      filteredRooms = filteredRooms.filter(
        (room) => room.capacity >= this.selectedCapacity
      );
      console.log("Selected Capacity:", this.selectedCapacity);
      this.filteredRooms = filteredRooms;

      // On conserve la salle sélectionnée si elle est toujours dans les salles filtrées
      if (
        this.selectedRoom &&
        !this.filteredRooms.some((r) => r.id === this.selectedRoom?.id)
      ) {
        this.selectedRoom =
          this.filteredRooms.length > 0 ? this.filteredRooms[0] : null;
      }
    },
    setSelectedCapacity(capacity: number) {
      this.selectedCapacity = capacity;
    },
    // On récupere tous les équipements
    async fetchEquipments() {
      this.loading = true;
      try {
        const response = await apiClient.get<Equipements[]>("/equipements");
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

    // On selectionne un équipement
    selectEquipment(equipmentName: string | null) {
      console.log("selectEquipment method");
      console.log("equipmentName :", equipmentName);
      console.log("avant update:", this.selectedEquipment);
      this.selectedEquipment = equipmentName;
      console.log("apres update:", this.selectedEquipment);
    },
  },
});
