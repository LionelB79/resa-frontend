<template>
  <div class="week-room-view">
    <div class="room-menu">
      <h2>Salles disponibles</h2>
      <div v-if="roomStore.loading"></div>
      <ul v-else>
        <li
          v-for="room in roomStore.rooms"
          :key="room.id"
          @click="selectRoom(room)"
        >
          {{ room.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useRoomStore } from "@/stores/roomStore";

export default {
  name: "WeekRoomView",
  setup() {
    const roomStore = useRoomStore();

    onMounted(() => {
      roomStore.fetchRooms();
    });

    //TODO ça marche pas !
    const selectRoom = (room) => {
      roomStore.selectRoom(room);
    };

    return {
      roomStore,
      selectRoom,
    };
  },
};
</script>

<style scoped>
.room-menu ul {
  list-style-type: none;
  padding: 0;
}

.room-menu li {
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.room-menu li:hover {
  background-color: #f0f0f0;
}
</style>
