<template>
  <RoomControls />
</template>

<script>
import RoomControls from "@/components/RoomControls.vue";

export default {
  name: "WeekRoomView",
  components: {
    RoomControls,
  },
  setup() {
    return {};
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
