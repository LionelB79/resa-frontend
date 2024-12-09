<template>
  <div class="modal-wrapper">
    <div class="modal">
      <h3>Détails de la réservation</h3>
      <p>Titre : {{ booking.bookingTitle }}</p>
      <p>Organisateur : {{ booking.userEmail }}</p>
    </div>

    <div class="modal-overlay"></div>
  </div>
</template>

<script>
export default {
  props: {
    booking: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  background: white;
  border: 1px solid #ddd;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
</style>
