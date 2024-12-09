<template>
  <div class="modal-wrapper">
    <div class="modal">
      <h3>Nouvelle réservation</h3>
      <p>
        Date : {{ formattedDate }}
        <br />
        Créneau : {{ formattedStartTime }} - {{ formattedEndTime }}
      </p>
      <p v-if="isSlotExpired" class="text-red-500">
        Le créneau sélectionné est déjà passé.
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
        <button @click="createBooking" :disabled="!isFormValid">
          Réserver
        </button>
        <button @click="$emit('close')">Annuler</button>
      </div>
    </div>

    <div class="modal-overlay" @click="$emit('close')"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits, defineProps } from "vue";
import { useBookingStore } from "@/stores/bookingStore";
import { addDays, setHours, setMinutes, isPast } from "date-fns";
import { fr } from "date-fns/locale";

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
// Compute if the selected time slot is in the past
const isSlotExpired = computed(() => {
  // Create the target date time for the selected slot
  const targetDateTime = setMinutes(
    setHours(
      addDays(bookingStore.selectedWeek, props.dayIndex),
      props.timeSlot.hour
    ),
    props.timeSlot.minutes
  );

  // Check if the target date time is in the past
  return isPast(targetDateTime);
});
// Compute formatted date and times
const formattedDate = computed(() => {
  const bookingDate = addDays(bookingStore.selectedWeek, props.dayIndex);
  return format(bookingDate, "EEEE dd MMMM yyyy", { locale: fr });
});

const formattedStartTime = computed(() => {
  return `${props.timeSlot.hour
    .toString()
    .padStart(2, "0")}:${props.timeSlot.minutes.toString().padStart(2, "0")}`;
});

const formattedEndTime = computed(() => {
  const startMinutes = props.timeSlot.hour * 60 + props.timeSlot.minutes;
  const endMinutes = startMinutes + selectedDuration.value;
  const endHour = Math.floor(endMinutes / 60);
  const endMinute = endMinutes % 60;
  return `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}`;
});

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
import { format } from "date-fns-tz";

export default defineComponent({
  name: "CreateBookingModal",
});
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
  z-index: 1000;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.modal {
  position: relative;
  background: white;
  border: 1px solid #ddd;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

/* Masquer l'arrière-plan lorsque la modal est affichée */

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
  transition: background-color 0.3s ease;
}

button:first-child {
  background-color: #4caf50;
  color: white;
}

button:first-child:disabled {
  background-color: #cccccc;
  color: #666666;
}

button:last-child {
  background-color: #f44336;
  color: white;
}

.text-red-500 {
  color: red;
}
</style>
