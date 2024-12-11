<template>
  <div class="week-scheduler">
    <!-- header + navigation entre semaines -->
    <div class="header">
      <v-btn
        @click="bookingStore.goToPreviousWeek"
        outlined
        class="week-nav-btn"
      >
        ← Semaine précédente
      </v-btn>
      <span>{{ bookingStore.getFormattedWeekRange() }}</span>
      <v-btn @click="bookingStore.goToNextWeek" outlined class="week-nav-btn">
        Semaine suivante →
      </v-btn>
    </div>

    <!-- Tableau représentant le planning -->
    <table class="week-table">
      <!-- En-tête du tableau avec les jours de la semaine -->
      <thead>
        <tr>
          <th>Heures</th>
          <th v-for="(day, index) in CONSTANT_DAYS_OF_WEEK" :key="index">
            {{ day }} - {{ bookingStore.formatDayWithMonth(index) }}
          </th>
        </tr>
      </thead>

      <!-- Corps du tableau avec les créneaux horaires -->
      <tbody>
        <tr
          v-for="timeSlot in timeSlots"
          :key="timeSlot.hour + timeSlot.minutes"
        >
          <td v-if="timeSlot.minutes === 0" class="time-cell" :rowspan="4">
            {{ timeSlot.hour }}:00
          </td>
          <td
            v-for="dayIndex in 7"
            :key="dayIndex"
            :class="getSlotClass(dayIndex - 1, timeSlot)"
            @click="handleSlotClick(dayIndex - 1, timeSlot)"
          >
            <div
              v-if="bookingStore.findBooking(dayIndex - 1, timeSlot)"
              :class="{
                'booking-first-slot': bookingStore.isFirstSlotOfBooking(
                  dayIndex - 1,
                  timeSlot
                ),
                'booking-continuation': !bookingStore.isFirstSlotOfBooking(
                  dayIndex - 1,
                  timeSlot
                ),
              }"
            >
              <small
                v-if="bookingStore.isFirstSlotOfBooking(dayIndex - 1, timeSlot)"
              >
                {{
                  bookingStore.findBooking(dayIndex - 1, timeSlot)?.bookingTitle
                }}
                {{
                  bookingStore.formatBookingTime(
                    bookingStore.findBooking(dayIndex - 1, timeSlot)
                  )
                }}
              </small>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modals -->
    <CreateBookingModal
      v-if="showCreateBookingModal && selectedTimeSlot && selectedDayIndex"
      :timeSlot="selectedTimeSlot"
      :dayIndex="selectedDayIndex"
      @close="showCreateBookingModal = false"
    />
    <InfoBookingModal
      v-if="showInfoBookingModal && selectedBooking"
      :booking="selectedBooking"
      @close="showInfoBookingModal = false"
    />
    <!--Informations debug -->
    <div class="debug-info">
      <h3>Debug Information</h3>
      <p>Selected Room: {{ roomStore.selectedRoom?._id }}</p>
      <p>Semaine sélectionnée : {{ bookingStore.selectedWeek }}</p>
      <p>Plage de semaine : {{ bookingStore.getFormattedWeekRange() }}</p>
      <h4>Réservations :</h4>
      <pre>{{ JSON.stringify(slots, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { CONSTANT_DAYS_OF_WEEK } from "@/constants/constants";
import { useRoomStore } from "@/stores/roomStore";
import { useBookingStore } from "@/stores/bookingStore";
import { Booking } from "@/types/booking";
import CreateBookingModal from "./modals/CreateBookingModal.vue";
import InfoBookingModal from "./modals/InfoBookingModal.vue";
// semaine sélectionnée (reactive), on l'initialise avec les jours correspondant aux date avec startOfWeek
const roomStore = useRoomStore();
const bookingStore = useBookingStore();
// ajout slots pour y attribuer les bookings récupérés pour la semaine
const slots = ref<Booking[]>([]);

// Créneaux horaires détaillés (de 8h à 18h avec séparation de 15 minutes)
const timeSlots = Array.from({ length: (18 - 8) * 4 }, (_, i) => ({
  hour: Math.floor(i / 4) + 8,
  minutes: (i % 4) * 15,
}));

const showCreateBookingModal = ref(false);
const showInfoBookingModal = ref(false);
const selectedBooking = ref<Booking | null>(null);
const selectedTimeSlot = ref<{ hour: number; minutes: number } | null>(null);
const selectedDayIndex = ref<number | null>(null);

// Gestion des clics sur les créneaux
const handleSlotClick = (
  dayIndex: number,
  timeSlot: { hour: number; minutes: number }
) => {
  const booking = bookingStore.findBooking(dayIndex, timeSlot);
  if (booking) {
    // Afficher la modal d'informations
    selectedBooking.value = booking;
    showInfoBookingModal.value = true;
  } else {
    // Afficher la modal de création
    selectedDayIndex.value = dayIndex;
    selectedTimeSlot.value = timeSlot;
    showCreateBookingModal.value = true;
  }
};

const getSlotClass = (
  dayIndex: number,
  timeSlot: { hour: number; minutes: number }
) => {
  const booking = bookingStore.findBooking(dayIndex, timeSlot);
  if (booking) {
    return {
      reserved: true,
    };
  }
  return { available: true };
};

// Observateur pour charger les réservations quand la salle change
watch(
  () => roomStore.selectedRoom,
  (newRoom) => {
    if (newRoom) {
      bookingStore.fetchBookings();
    }
  }
);

// Charger les données initiales
onMounted(async () => {
  if (!roomStore.selectedRoom) {
    await roomStore.fetchRooms();
  }

  if (roomStore.selectedRoom) {
    bookingStore.fetchBookings();
  } else {
    console.warn("Aucune salle sélectionnée au montage");
  }
});
</script>

<style scoped>
.week-scheduler {
  width: 100%;
  margin: 20px auto;
}

.room-selection {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
  padding-bottom: 5px;
}

.week-nav-btn {
  font-size: 11px;
  color: #ffffff;
  background-color: #6c757d;
  border-color: #5a6268;
  padding: 2px 2px;
  height: 10px;
  line-height: normal;
  width: 175px;
  transition: background-color 0.3s ease;
}

.week-table {
  width: 100%;
  border-collapse: collapse;
}

.week-table th,
.week-table td {
  border: 1px solid #ddd;
  text-align: center;
  font-size: 0.8em;
}

.week-table th:nth-child(n + 2),
.week-table td:nth-child(n + 2) {
  width: 235px;
}

.week-table tbody tr {
  height: 20px;
}

td {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

td:hover {
  background-color: #f0f0f0;
}

.debug-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  overflow-x: auto;
}

.available {
  background-color: #e6f7ff;
  cursor: pointer;
}

.reserved {
  background-color: #59a1db;
  color: #004d40;
}

.booking-first-slot {
  background-color: #59a1db;
  color: #00332c;
  border-top: 2px solid #113666;
}

.booking-continuation {
  background-color: #59a1db;
  color: #00332c;
  border: none;
}

.week-table td.reserved {
  border: none;
}
</style>
