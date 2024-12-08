<template>
  <div class="modal">
    <h3>Détails de la réservation</h3>
    <p>Titre : {{ booking.bookingTitle }}</p>
    <p>Organisateur : {{ booking.userEmail }}</p>
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
  methods: {},
};
</script>

<style scoped>
.modal {
  background: white;
  border: 1px solid #ddd;
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
