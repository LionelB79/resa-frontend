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
        {{ ROOM_CONTROLS_MESSAGES.SLOT_EXPIRED }}
      </p>
      <p v-if="isOverlappingSlot" class="text-red-500">
        {{ ROOM_CONTROLS_MESSAGES.SLOT_OVERLAPPING }} <br />
        {{ ROOM_CONTROLS_MESSAGES.REDUCE_THE_DURATION }}
      </p>

      <p v-if="isEndTimeAfter18h" class="text-red-500">
        {{ ROOM_CONTROLS_MESSAGES.END_TIME_AFTER_18H }} <br />
        {{ ROOM_CONTROLS_MESSAGES.REDUCE_THE_DURATION }}
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
        <button
          @click="createBooking"
          :disabled="!isFormValid || isOverlappingSlot || isEndTimeAfter18h"
        >
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
import { CONSTANT_DURATION_OPTIONS } from "@/constants/constants";
import { ROOM_CONTROLS_MESSAGES } from "@/constants/messages";
import { format } from "date-fns-tz";
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

// Vérifie si le slot est antérieur
const isSlotExpired = computed(() => {
  const targetDateTime = setMinutes(
    setHours(
      addDays(bookingStore.selectedWeek, props.dayIndex),
      props.timeSlot.hour
    ),
    props.timeSlot.minutes
  );

  return isPast(targetDateTime);
});
// Vérifie si l'heure de fin dépasse 18h
const isEndTimeAfter18h = computed(() => {
  const endHour = parseInt(formattedEndTime.value.split(":")[0]);
  const endMinute = parseInt(formattedEndTime.value.split(":")[1]);

  return endHour > 18 || (endHour === 18 && endMinute > 0);
});

// Affiche la date dans la modal en fr
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
//TODO A améliorer en checkant uniquement le prochain booking
// Vérifie si le créneau sélectionné chevauche un créneau existant
const isOverlappingSlot = computed(() => {
  // Crée précisément l'heure de début du nouveau créneau en UTC pour éviter les problèmes de fuseau horaire
  const selectedStartTime = new Date(
    Date.UTC(
      bookingStore.selectedWeek.getFullYear(),
      bookingStore.selectedWeek.getMonth(),
      bookingStore.selectedWeek.getDate() + props.dayIndex,
      props.timeSlot.hour,
      props.timeSlot.minutes
    )
  );
  // Calcule l'heure de fin du nouveau créneau en ajoutant la durée sélectionnée (en millisecondes)

  const selectedEndTime = new Date(
    selectedStartTime.getTime() + selectedDuration.value * 60000
  );

  // Vérifie s'il y a un chevauchement avec l'une des réservations existantes
  return bookingStore.slots.some((booking) => {
    const bookingStartTime = new Date(booking.startTime);
    const bookingEndTime = new Date(booking.endTime);

    const isOverlapping =
      (selectedStartTime >= bookingStartTime &&
        selectedStartTime < bookingEndTime) || // Le début du créneau est dans une réservation existante (normalement impossible)
      (selectedEndTime > bookingStartTime &&
        selectedEndTime <= bookingEndTime) || // La fin du créneau est dans une réservation existante
      (selectedStartTime <= bookingStartTime &&
        selectedEndTime >= bookingEndTime); // Le créneau englobe complètement une réservation existante

    return isOverlapping;
  });
});
</script>

<script lang="ts">
import { defineComponent } from "vue";

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
