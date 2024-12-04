<template>
  <div class="controls-container">
    <div class="filters">
      <!-- Sélection des équipements -->
      <div class="filter-group">
        <label for="equipment-select">Équipements :</label>
        <select
          id="equipment-select"
          @change="onEquipmentChange($event)"
          class="select-input"
        >
          <option value="">Sélectionner un équipement</option>
          <option
            v-for="equipment in roomStore.equipements"
            :key="equipment.id"
            :value="equipment.name"
            :disabled="roomStore.selectedEquipments.includes(equipment.name)"
          >
            {{ equipment.name }}
          </option>
        </select>

        <!-- Bulles des équipements sélectionnés -->
        <div
          v-if="roomStore.selectedEquipments.length > 0"
          class="selected-equipments"
        >
          <span
            v-for="equipment in roomStore.selectedEquipments"
            :key="equipment"
            class="equipment-bubble"
          >
            {{ equipment }}
            <button
              @click="removeEquipment(equipment)"
              class="remove-equipment"
            >
              ×
            </button>
          </span>
          <button @click="clearEquipments" class="clear-equipments">
            Effacer tous
          </button>
        </div>
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
          <option
            v-for="roomCapacity in roomCapacities"
            :key="roomCapacity.value"
            :value="roomCapacity.value"
          >
            {{ roomCapacity.label }}
          </option>
        </select>
      </div>
      <!-- Liste des salles filtrées -->
      <div class="filter-group">
        <label for="room-select">Salles disponibles :</label>
        <select
          v-if="!roomStore.noRoomsFound"
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
        <div v-if="roomStore.noRoomsFound" class="no-rooms-message">
          {{ ROOM_CONTROLS_MESSAGES.NO_ROOMS_FOUND }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoomStore } from "@/stores/roomStore";
import { ROOM_CAPACITIES } from "@/constants/constants";
import { ROOM_CONTROLS_MESSAGES } from "@/constants/messages";

const roomStore = useRoomStore();
const roomCapacities = ROOM_CAPACITIES;

onMounted(() => {
  roomStore.fetchRooms();
  roomStore.fetchEquipments();
});

// Gestion du changement de salle
const onRoomChange = (event) => {
  const roomId = event.target.value;
  roomStore.selectRoom(roomId);
  console.log("roomId", roomId);
};

// Gestion du changement de capacité
const onCapacityChange = (event) => {
  const capacity = Number(event.target.value);
  roomStore.setSelectedCapacity(capacity);
  roomStore.filterRooms();
};

// Gestion du changement d'équipement
const onEquipmentChange = (event) => {
  const equipmentName = event.target.value;
  if (equipmentName) {
    roomStore.addEquipment(equipmentName);
    event.target.value = "";
  }
};

// Supprimer un équipement
const removeEquipment = (equipmentName) => {
  roomStore.removeEquipment(equipmentName);
};

// Effacer tous les équipements
const clearEquipments = () => {
  roomStore.clearEquipments();
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

.no-rooms-message {
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #fecaca;
  text-align: center;
}

.selected-equipments {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.equipment-bubble {
  background-color: #e6f2ff;
  border: 1px solid #3182ce;
  color: #2c5282;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.remove-equipment {
  background: none;
  border: none;
  color: #3182ce;
  cursor: pointer;
  font-weight: bold;
}

.clear-equipments {
  background-color: #f56565;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  margin-left: 0.5rem;
}
</style>
