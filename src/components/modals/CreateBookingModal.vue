<template>
  <div class="modal">
    <h3>Nouvelle réservation</h3>
    <p>
      Créneau sélectionné : {{ timeSlot.hour }}:{{
        padMinutes(timeSlot.minutes)
      }}
      - Jour
      {{ dayIndex + 1 }}
    </p>

    <div class="form-group">
      <label for="booking-title">Titre de la réservation</label>
      <input
        id="booking-title"
        v-model="bookingTitle"
        type="text"
        placeholder="Entrez un titre"
      />
    </div>

    <div class="form-group">
      <label for="booking-email">Email de réservation</label>
      <input
        id="booking-email"
        v-model="userEmail"
        type="email"
        placeholder="Entrez votre email"
        required
      />
    </div>

    <div class="form-group">
      <label for="booking-duration">Durée de la réservation</label>
      <select id="booking-duration" v-model="selectedDuration" required>
        <option
          v-for="duration in CONSTANT_DURATION_OPTIONS"
          :key="duration"
          :value="duration"
        >
          {{ duration }} minutes
        </option>
      </select>
    </div>

    <div class="modal-actions">
      <button @click="createBooking" :disabled="!isFormValid">Réserver</button>
      <button @click="$emit('close')">Annuler</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, defineProps } from "vue";
import { useBookingStore } from "@/stores/bookingStore";
const props = defineProps<{
  timeSlot: {
    hour: number;
    minutes: number;
  };
  dayIndex: number;
}>();

const emit = defineEmits(["close"]);

const bookingStore = useBookingStore();

// détails du booking
const bookingTitle = ref("");
const userEmail = ref("");
const selectedDuration = ref(15);

// Vérifie que le champ n'est pas vide et que le mail est bien un mail
const isFormValid = computed(
  () =>
    userEmail.value.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.value)
);

// On force l'affichage de 2 caractère pour les minutes ( 5 -> 05)
const padMinutes = (minutes: number) => minutes.toString().padStart(2, "0");

const createBooking = async () => {
  try {
    await bookingStore.createBooking({
      bookingTitle: bookingTitle.value,
      userEmail: userEmail.value,
      dayIndex: props.dayIndex,
      timeSlot: props.timeSlot,
      selectedDuration: selectedDuration.value,
    });
    // On ferme la modal
    emit("close");
  } catch (error) {
    console.error("Erreur lors de la création de la réservation", error);
  }
};
</script>

<script lang="ts">
import { defineComponent } from "vue";
import { CONSTANT_DURATION_OPTIONS } from "@/constants/constants";

export default defineComponent({
  name: "CreateBookingModal",
});
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

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:first-child {
  background-color: #4caf50;
  color: white;
}

button:last-child {
  background-color: #f44336;
  color: white;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
