<template>
  <div class="controls-container">
    <div class="filters">
      <div class="filter-group">
        <label for="room-select">Salles disponibles :</label>
        <select
          id="room-select"
          :value="roomStore.selectedRoom?.id || ''"
          @change="onRoomChange($event)"
          class="select-input"
        >
          <!-- Liste des salles -->
          <option
            v-for="room in roomStore.rooms"
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

export default {
  name: "RoomDropdown",
  setup() {
    const roomStore = useRoomStore();

    // Charger les salles au montage du composant
    onMounted(() => {
      roomStore.fetchRooms();
    });

    // Gestion du changement de salle
    const onRoomChange = (event) => {
      const roomId = event.target.value;
      roomStore.selectRoom(roomId);
      console.log("roomId", roomId);
    };

    return {
      roomStore,
      onRoomChange,
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
