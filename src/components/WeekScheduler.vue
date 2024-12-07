<template>
  <div class="week-scheduler">
    <!-- header + navigation entre semaines -->
    <div class="header">
      <button @click="goToPreviousWeek">← Semaine précédente</button>
      <span>{{ formattedWeekRange }}</span>
      <button @click="goToNextWeek">Semaine suivante →</button>
    </div>

    <!-- Tableau représentant le planning -->
    <table class="week-table">
      <!-- En-tête du tableau avec les jours de la semaine -->
      <thead>
        <tr>
          <th>Heures</th>
          <th v-for="(day, index) in CONSTANT_DAYS_OF_WEEK" :key="index">
            {{ day }} - {{ formatDayWithMonth(index) }}
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
              v-if="findBooking(dayIndex - 1, timeSlot)"
              :class="{
                'booking-first-slot': isFirstSlotOfBooking(
                  dayIndex - 1,
                  timeSlot
                ),
                'booking-continuation': !isFirstSlotOfBooking(
                  dayIndex - 1,
                  timeSlot
                ),
              }"
            >
              <small v-if="isFirstSlotOfBooking(dayIndex - 1, timeSlot)">
                {{ findBooking(dayIndex - 1, timeSlot)?.bookingTitle }}
              </small>
              <small v-if="isFirstSlotOfBooking(dayIndex - 1, timeSlot)">
                {{ formatBookingTime(findBooking(dayIndex - 1, timeSlot)) }}
              </small>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!--Informations debug -->
    <div class="debug-info">
      <h3>Debug Information</h3>
      <p>Selected Room: {{ roomStore.selectedRoom?._id }}</p>
      <p>Semaine sélectionnée : {{ selectedWeek }}</p>
      <p>Plage de semaine : {{ formattedWeekRange }}</p>
      <h4>Réservations :</h4>
      <pre>{{ JSON.stringify(slots, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  addDays,
  format,
  parseISO,
  setHours,
  setMinutes,
  startOfWeek,
} from "date-fns";
import {
  CONSTANT_D_MMM_YYYY,
  CONSTANT_DAYS_OF_WEEK,
  CONSTANT_TIMEZONE_UTC,
} from "@/constants/constants";
import { useRoomStore } from "@/stores/roomStore";
import apiClient from "@/api/api";
import { Booking } from "@/types/booking";
import { formatInTimeZone } from "date-fns-tz";

// semaine sélectionnée (reactive), on l'initialise avec les jours correspondant aux date avec startOfWeek
const selectedWeek = ref(startOfWeek(new Date(), { weekStartsOn: 1 }));
const roomStore = useRoomStore();
// ajout slots pour y attribuer les bookings récupérés pour la semaine
const slots = ref<Booking[]>([]);

// Créneaux horaires détaillés (de 8h à 18h avec séparation de 15 minutes)
const timeSlots = Array.from({ length: (18 - 8) * 4 }, (_, i) => ({
  hour: Math.floor(i / 4) + 8,
  minutes: (i % 4) * 15,
}));

// On récupère les réservations pour la salle et la semaine sélectionnée
const fetchBookings = async () => {
  // Log pour déboguer
  console.log("Salle sélectionnée:", roomStore.selectedRoom);

  // Vérification qu'une room est selectionnée
  if (!roomStore.selectedRoom) {
    console.warn("Aucune salle sélectionnée");
    slots.value = [];
    return;
  }
  console.log("roomStore.selectedRoom", roomStore.selectedRoom);
  try {
    const response = await apiClient.get(
      `/booking/room/${roomStore.selectedRoom._id}/week?weekStart=${format(
        selectedWeek.value,
        "yyyy-MM-dd"
      )}`
    );
    // On attribut un booking à un slot
    slots.value = response.data;
    console.log("Réservations récupérées:", slots.value);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations", error);
    slots.value = [];
  }
};
// Méthodes pour naviguer entre les semaines
const goToPreviousWeek = () => {
  selectedWeek.value = addDays(selectedWeek.value, -7);
  if (roomStore.selectedRoom) {
    fetchBookings();
  }
};
const goToNextWeek = () => {
  selectedWeek.value = addDays(selectedWeek.value, 7);
  if (roomStore.selectedRoom) {
    fetchBookings();
  }
};

// Affichage jour num Mois exemple: Lundi-2 Dec
const formatDayWithMonth = (dayIndex: number) => {
  const dayDate = addDays(selectedWeek.value, dayIndex);
  console.log("dayDate", dayDate);
  return format(dayDate, "d MMM");
};

// Calcul de la plage de dates de la semaine
const formattedWeekRange = computed(() => {
  const start = format(selectedWeek.value, CONSTANT_D_MMM_YYYY);
  const end = format(addDays(selectedWeek.value, 6), CONSTANT_D_MMM_YYYY);

  return `${start} - ${end}`;
});

// Gestion des clics sur les créneaux
const handleSlotClick = (
  dayIndex: number,
  timeSlot: { hour: number; minutes: number }
) => {
  const booking = findBooking(dayIndex, timeSlot);
  if (booking) {
    alert(`Réservation existante : ${booking.bookingTitle}`);
  } else {
    alert(`Créneau disponible : ${timeSlot.hour}:${timeSlot.minutes}`);
  }
};
const isFirstSlotOfBooking = (
  dayIndex: number,
  timeSlot: { hour: number; minutes: number }
): boolean => {
  const booking = findBooking(dayIndex, timeSlot);
  if (!booking) return false;

  const startHour = formatInTimeZone(
    parseISO(booking.startTime),
    CONSTANT_TIMEZONE_UTC,
    "HH"
  );
  const startMinutes = formatInTimeZone(
    parseISO(booking.startTime),
    CONSTANT_TIMEZONE_UTC,
    "mm"
  );
  return (
    parseInt(startHour) === timeSlot.hour &&
    parseInt(startMinutes) === timeSlot.minutes
  );
};
const getSlotClass = (
  dayIndex: number,
  timeSlot: { hour: number; minutes: number }
) => {
  const booking = findBooking(dayIndex, timeSlot);
  if (booking) {
    return {
      reserved: true,
    };
  }
  return { available: true };
};

const findBooking = (
  dayIndex: number,
  timeSlot: { hour: number; minutes: number }
): Booking | undefined => {
  const targetDate = addDays(selectedWeek.value, dayIndex);
  const targetDateTime = setMinutes(
    setHours(targetDate, timeSlot.hour),
    timeSlot.minutes
  );

  return slots.value.find((slot) => {
    const startTime = parseISO(slot.startTime);
    const endTime = parseISO(slot.endTime);
    const targetTime = parseISO(
      format(targetDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    );
    return targetTime >= startTime && targetTime < endTime;
  });
};
//on affiche l'heure de la reservation
const formatBookingTime = (booking?: Booking) => {
  if (!booking) return "";

  // Conversion en UTC (sinon decalage d'une heure à cause de l'environnement local en utc +1)
  const startTime = formatInTimeZone(
    booking.startTime,
    CONSTANT_TIMEZONE_UTC,
    "HH:mm"
  );
  const endTime = formatInTimeZone(
    booking.endTime,
    CONSTANT_TIMEZONE_UTC,
    "HH:mm"
  );
  return `${startTime} - ${endTime}`;
};

// Observateur pour charger les réservations quand la salle change
watch(
  () => roomStore.selectedRoom,
  (newRoom) => {
    if (newRoom) {
      fetchBookings();
    }
  }
);

// Charger les données initiales
onMounted(async () => {
  if (!roomStore.selectedRoom) {
    await roomStore.fetchRooms();
  }

  if (roomStore.selectedRoom) {
    fetchBookings();
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
  justify-content: space-between;
  margin-bottom: 10px;
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
  background-color: #ff4d4f;
  color: red;
}

.booking-first-slot {
  background-color: #ff4d4f;
  color: white;
  border-top: 2px solid black;
}

.booking-continuation {
  background-color: #ff4d4f;
  color: white;
  border: none;
}

.week-table td.reserved {
  border: none;
}
</style>
