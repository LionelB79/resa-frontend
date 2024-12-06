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
            @click="handleSlotClick(dayIndex - 1, timeSlot)"
          >
            <!-- Espace réservé pour les réservations futures -->
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
      <pre>Créneaux horaires : {{ JSON.stringify(timeSlots, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { addDays, format, setHours, setMinutes } from "date-fns";
import {
  CONSTANT_D_MMM_YYYY,
  CONSTANT_DAYS_OF_WEEK,
} from "@/constants/constants";
import { useRoomStore } from "@/stores/roomStore";

// semaine sélectionnée (reactive)
const selectedWeek = ref(new Date());
const roomStore = useRoomStore();

// Créneaux horaires détaillés (de 8h à 18h avec séparation de 15 minutes)
const timeSlots = Array.from({ length: (18 - 8) * 4 }, (_, i) => ({
  hour: Math.floor(i / 4) + 8,
  minutes: (i % 4) * 15,
}));

// Méthodes pour naviguer entre les semaines
const goToPreviousWeek = () => {
  selectedWeek.value = addDays(selectedWeek.value, -7);
};
const goToNextWeek = () => {
  selectedWeek.value = addDays(selectedWeek.value, 7);
};

// Affichage jour num Mois exemple: Lundi-2 Dec
const formatDayWithMonth = (dayIndex: number) => {
  const dayDate = addDays(selectedWeek.value, dayIndex);
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
  const targetDate = addDays(selectedWeek.value, dayIndex);
  const targetDateTime = setMinutes(
    setHours(targetDate, timeSlot.hour),
    timeSlot.minutes
  );

  //TODO a refaire, pour l'instant, simple log de la date/heure cliquée
  console.log(`Créneau cliqué : ${targetDateTime}`);
  alert(`Créneau : ${format(targetDateTime, "EEEE d MMM HH:mm")}`);
};
</script>

<style scoped>
.week-scheduler {
  width: 100%;
  margin: 20px auto;
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
  padding: 5px;
}

.time-cell {
  background-color: #f5f5f5;
  font-weight: bold;
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
</style>
