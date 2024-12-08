<template>
  <RoomControls />
  <WeekScheduler />
</template>

<script>
import RoomControls from "@/components/RoomControls.vue";
import WeekScheduler from "@/components/WeekScheduler.vue";

export default {
  name: "WeekRoomView",
  components: {
    RoomControls,
    WeekScheduler,
  },
  setup() {
    return {};
  },
};
</script>

<style scoped></style>
