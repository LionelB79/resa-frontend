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
    selectedEquipments: [] as string[],
    noRoomsFound: false,
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
      console.log("Selected Equipment:", this.selectedEquipments);

      // Filtrage par équipement
      if (this.selectedEquipments.length > 0) {
        filteredRooms = filteredRooms.filter((room) =>
          this.selectedEquipments.every((selectedEquip) =>
            room.equipements.some((equip) => equip.name === selectedEquip)
          )
        );
      }

      // Filtrage par capacité
      filteredRooms = filteredRooms.filter(
        (room) => room.capacity >= this.selectedCapacity
      );
      console.log("Selected Capacity:", this.selectedCapacity);

      //On vérifie si la liste de salle est vide apres filtrage
      this.noRoomsFound = filteredRooms.length === 0;

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
