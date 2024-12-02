<template>
  <div class="controls-container">
    <div class="filters">
      <!-- Sélection des équipements -->
      <div class="filter-group">
        <label for="equipment-select">Équipements :</label>
        <select
          id="equipment-select"
          :value="equipementStore.selectedEquipment || ''"
          @change="onEquipmentChange($event)"
          class="select-input"
        >
          <option value="">Aucun</option>
          <option
            v-for="equipment in equipementStore.equipements"
            :key="equipment.id"
            :value="equipment.name"
          >
            {{ equipment.name }}
          </option>
        </select>
      </div>
      <!-- Filtre de capacité -->
      <div class="filter-group">
        <label for="capacity-select">Capacité minimale :</label>
        <select
          id="capacity-select"
          :value="roomStore.selectedCapacity"
          @change="onCapacityChange($event)"
          class="select-input"
        >
          <option value="5">5+</option>
          <option value="10">10+</option>
          <option value="15">15+</option>
          <option value="20">20+</option>
          <option value="25">25+</option>
        </select>
      </div>
      <!-- Liste des salles filtrées -->
      <div class="filter-group">
        <label for="room-select">Salles disponibles :</label>
        <select
          id="room-select"
          :value="roomStore.selectedRoom?.id || ''"
          @change="onRoomChange($event)"
          class="select-input"
        >
          <option
            v-for="room in roomStore.filteredRooms"
            :key="room.id"
            :value="room.id"
          >
            {{ room.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useRoomStore } from "@/stores/roomStore";
import { useEquipementStore } from "@/stores/equipementsStore";

export default {
  name: "WeekRoomView",
  setup() {
    const roomStore = useRoomStore();
    const equipementStore = useEquipementStore();

    onMounted(() => {
      roomStore.fetchRooms();
      equipementStore.fetchEquipments();
    });

    // Gestion du changement de salle
    const onRoomChange = (event) => {
      const roomId = event.target.value;
      roomStore.selectRoom(roomId);
      console.log("roomId", roomId);
    };

    // Gestion du changement d'équipement
    const onEquipmentChange = (event) => {
      const equipmentName = event.target.value || null;
      console.log("onEquipmentChange equipmentName", equipmentName);
      equipementStore.selectEquipment(equipmentName);
      roomStore.filterRooms();
    };

    // Gestion du changement de capacité
    const onCapacityChange = (event) => {
      const capacity = Number(event.target.value);
      roomStore.setSelectedCapacity(capacity);
      roomStore.filterRooms();
    };
    return {
      roomStore,
      equipementStore,
      onRoomChange,
      onEquipmentChange,
      onCapacityChange,
    };
  },
};
</script>

<style scoped>
.controls-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #f9fafb;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  width: 60%;
}

.filters {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.select-input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  width: 100%;
}

.select-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
}
</style>
