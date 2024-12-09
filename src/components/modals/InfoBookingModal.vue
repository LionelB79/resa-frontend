<template>
  <div class="modal-wrapper">
    <div class="modal">
      <h3>Détails de la réservation</h3>
      <p>Titre : {{ booking.bookingTitle }}</p>
      <p>Organisateur : {{ booking.userEmail }}</p>

      <div class="modal-actions">
        <button @click="$emit('close')">Fermer</button>
      </div>
    </div>

    <div class="modal-overlay" @click="$emit('close')"></div>
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
  emits: ["close"],
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

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f44336;
  color: white;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #d32f2f;
}
</style>
