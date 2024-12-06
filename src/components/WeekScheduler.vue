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
            {{ day }}
          </th>
        </tr>
      </thead>

      <!-- Corps du tableau avec les créneaux horaires -->
      <tbody>
        <tr v-for="timeSlot in timeSlots" :key="timeSlot">
          <td>{{ timeSlot }}:00</td>
          <td v-for="day in 7" :key="day"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { addDays, format } from "date-fns";
import {
  CONSTANT_D_MMM_YYYY,
  CONSTANT_DAYS_OF_WEEK,
} from "@/constants/constants";

// semaine sélectionnée (reactive)
const selectedWeek = ref(new Date());

// Génération des créneaux horaires (de 8h à 18h)
const timeSlots = Array.from({ length: 10 }, (_, i) => i + 8);

// Méthodes pour naviguer entre les semaines
const goToPreviousWeek = () => {
  selectedWeek.value = addDays(selectedWeek.value, -7);
};
const goToNextWeek = () => {
  selectedWeek.value = addDays(selectedWeek.value, 7);
};

// Calcul de la plage de dates de la semaine
const formattedWeekRange = computed(() => {
  const start = format(selectedWeek.value, CONSTANT_D_MMM_YYYY);
  const end = format(addDays(selectedWeek.value, 6), CONSTANT_D_MMM_YYYY);

  return `${start} - ${end}`;
});
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
</style>
