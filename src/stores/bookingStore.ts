import { defineStore } from "pinia";
import apiClient from "@/api/api";
import { Booking } from "@/types/booking";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import { useRoomStore } from "@/stores/roomStore";
import { API_ENDPOINTS } from "@/constants/api-constants";
import { formatInTimeZone } from "date-fns-tz";
import { CONSTANT_TIMEZONE_UTC } from "@/constants/constants";

export const useBookingStore = defineStore("bookings", {
  state: () => ({
    slots: [] as Booking[],
  }),

  actions: {
    async fetchBookings(selectedWeek: Date) {
      const roomStore = useRoomStore();

      // Vérification qu'une room est selectionnée
      if (!roomStore.selectedRoom) {
        console.warn("Aucune salle sélectionnée");
        this.slots = [];
        return;
      }

      try {
        const url = API_ENDPOINTS.BOOKINGS.GET_ROOM_BOOKINGS_FOR_WEEK(
          roomStore.selectedRoom._id,
          format(selectedWeek, "yyyy-MM-dd")
        );
        const response = await apiClient.get(url);

        // On attribue les bookings au slots
        this.slots = response.data;
        console.log("Réservations récupérées:", this.slots);
      } catch (error) {
        console.error("Erreur lors de la récupération des réservations", error);
        this.slots = [];
      }
    },
    findBooking(
      selectedWeek: Date,
      dayIndex: number,
      timeSlot: { hour: number; minutes: number }
    ): Booking | undefined {
      // On créé une date pour le jour spécifique de la semaine sélectionnée
      const targetDate = new Date(selectedWeek);
      targetDate.setDate(targetDate.getDate() + dayIndex);

      // On contruit la date et l'heure exactes du créneau à vérifier
      const targetDateTime = setMinutes(
        setHours(targetDate, timeSlot.hour),
        timeSlot.minutes
      );
      // On recherche une réservation qui englobe le créneau horaire cible
      return this.slots.find((slot) => {
        const startTime = parseISO(slot.startTime);
        const endTime = parseISO(slot.endTime);
        // On convertie le créneau cible en format ISO pour une comparaison précise
        const targetTime = parseISO(
          format(targetDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        );
        // On vérifie si le temps cible est compris entre le début et la fin de la réservation
        //On met < endTime et pas <= pour ne pas englober le slot de 15min suivant
        return targetTime >= startTime && targetTime < endTime;
      });
    },
    isFirstSlotOfBooking(
      selectedWeek: Date,
      dayIndex: number,
      timeSlot: { hour: number; minutes: number }
    ): boolean {
      // On prend la réservation correspondant au créneau horaire et au jour donnés
      const booking = this.findBooking(selectedWeek, dayIndex, timeSlot);
      if (!booking) return false;

      // On récupère l'heure de début de la réservation en UTC et la formate en heures
      const startHour = formatInTimeZone(
        parseISO(booking.startTime),
        CONSTANT_TIMEZONE_UTC,
        "HH"
      );
      // On récupère les minutes de début de la réservation en UTC
      const startMinutes = formatInTimeZone(
        parseISO(booking.startTime),
        CONSTANT_TIMEZONE_UTC,
        "mm"
      );

      // On vérifie si l'heure et les minutes du créneau correspondent exactement à l'heure de début de la réservation
      return (
        parseInt(startHour) === timeSlot.hour &&
        parseInt(startMinutes) === timeSlot.minutes
      );
    },
    //on affiche l'heure de la reservation
    formatBookingTime(booking?: Booking): string {
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
    },
  },

  getters: {
    getSlots(): Booking[] {
      return this.slots;
    },
  },
});
