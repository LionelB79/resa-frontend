import { defineStore } from "pinia";
import { Room } from "@/types/room";
import apiClient from "@/api/api";
import { useEquipementStore } from "@/stores/equipementsStore";

export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [] as Room[],
    loading: false,
    error: null as string | null,
    selectedRoom: null as Room | null,
    filteredRooms: [] as Room[],
    selectedCapacity: 5,
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
      const equipementStore = useEquipementStore();
      let filteredRooms = this.rooms;
      console.log("Selected Equipment:", equipementStore.selectedEquipment);

      // Filtrage par équipement
      if (equipementStore.selectedEquipment) {
        filteredRooms = filteredRooms.filter((room) =>
          room.equipements.some(
            (equip) => equip.name === equipementStore.selectedEquipment
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
  },
});
