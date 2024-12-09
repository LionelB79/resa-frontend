import { defineStore } from "pinia";
import apiClient from "@/api/api";
import { Booking } from "@/types/booking";
import {
  addDays,
  format,
  parseISO,
  setHours,
  setMinutes,
  startOfWeek,
} from "date-fns";
import { useRoomStore } from "@/stores/roomStore";
import { API_ENDPOINTS } from "@/constants/api-constants";
import { formatInTimeZone } from "date-fns-tz";
import {
  CONSTANT_D_MMM_YYYY,
  CONSTANT_TIMEZONE_PARIS,
  CONSTANT_TIMEZONE_UTC,
} from "@/constants/constants";

export const useBookingStore = defineStore("bookings", {
  state: () => ({
    slots: [] as Booking[],
    selectedWeek: startOfWeek(new Date(), { weekStartsOn: 1 }),
  }),

  actions: {
    async fetchBookings() {
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
          format(this.selectedWeek, "yyyy-MM-dd")
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
      dayIndex: number,
      timeSlot: { hour: number; minutes: number }
    ): Booking | undefined {
      // On créé une date pour le jour spécifique de la semaine sélectionnée
      const targetDate = new Date(this.selectedWeek);
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
      dayIndex: number,
      timeSlot: { hour: number; minutes: number }
    ): boolean {
      // On prend la réservation correspondant au créneau horaire et au jour donnés
      const booking = this.findBooking(dayIndex, timeSlot);
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
    goToPreviousWeek() {
      this.selectedWeek = addDays(this.selectedWeek, -7);
      this.fetchBookings();
    },

    goToNextWeek() {
      this.selectedWeek = addDays(this.selectedWeek, 7);
      this.fetchBookings();
    },
    // Affichage jour num Mois exemple: Lundi-2 Dec

    formatDayWithMonth(dayIndex: number): string {
      const dayDate = addDays(this.selectedWeek, dayIndex);
      return format(dayDate, "d MMM");
    },
    // Calcul de la plage de dates de la semaine

    getFormattedWeekRange(): string {
      const start = format(this.selectedWeek, CONSTANT_D_MMM_YYYY);
      const end = format(addDays(this.selectedWeek, 6), CONSTANT_D_MMM_YYYY);

      return `${start} - ${end}`;
    },
    async createBooking(params: {
      bookingTitle: string;
      userEmail: string;
      dayIndex: number;
      timeSlot: { hour: number; minutes: number };
      selectedDuration: number;
    }) {
      const roomStore = useRoomStore();

      // Vérification qu'une room est sélectionnée
      if (!roomStore.selectedRoom) {
        console.error("Aucune salle sélectionnée");
        throw new Error("Aucune salle sélectionnée");
      }

      // On créer la date/heure du booking (debut du booking)
      const startDateUTC = new Date(
        Date.UTC(
          this.selectedWeek.getFullYear(),
          this.selectedWeek.getMonth(),
          this.selectedWeek.getDate() + params.dayIndex,
          params.timeSlot.hour,
          params.timeSlot.minutes
        )
      );

      //On convertie en fuseau horaire de Paris utc+1() sinon enregistrement avec 1h de decalage)
      const startDateParis = formatInTimeZone(
        startDateUTC,
        CONSTANT_TIMEZONE_PARIS,
        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
      );

      // On calcule la date de fin avec la durée sélectionnée
      const endDateUTC = new Date(
        startDateUTC.getTime() + params.selectedDuration * 60000
      );

      // On convertie la date de fin en fuseau horaire de Paris
      const endDateParis = formatInTimeZone(
        endDateUTC,
        CONSTANT_TIMEZONE_PARIS,
        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
      );
      // On envoie les données au backend
      try {
        const response = await apiClient.post(API_ENDPOINTS.BOOKINGS.CREATE, {
          userEmail: params.userEmail,
          roomId: roomStore.selectedRoom?._id,
          bookingTitle: params.bookingTitle,
          startTime: startDateParis,
          endTime: endDateParis,
        });

        // On actualise les réservations après la création
        await this.fetchBookings();

        return response;
      } catch (error) {
        console.error("Erreur lors de la création de la réservation", error);
        throw error;
      }
    },
  },

  getters: {
    getSlots(): Booking[] {
      return this.slots;
    },
  },
});
