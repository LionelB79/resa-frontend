import { defineStore } from "pinia";
import apiClient from "@/api/api";
import { Equipements } from "@/types/equipements";

export const useEquipementStore = defineStore("equipements", {
  state: () => ({
    equipements: [] as Equipements[], // Liste des équipements
    selectedEquipment: null as string | null, // Équipement sélectionné
    loading: false, // Indicateur de chargement
    error: null as string | null, // Message d'erreur
  }),

  actions: {
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
    selectEquipment(name: string | null) {
      this.selectedEquipment = name;
    },
  },
});
