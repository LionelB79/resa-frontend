export const API_CONFIG = {
  BASE_URL: "http://localhost:3001",
  HEADERS: {
    "Content-Type": "application/json",
  },
};

export const API_ENDPOINTS = {
  ROOMS: {
    GET_ALL: "/rooms",
  },

  EQUIPMENTS: {
    GET_ALL: "/equipements",
  },
  BOOKINGS: {
    //TODO endpoints a revoir
    GET_ROOM_BOOKINGS_FOR_WEEK: (roomId: string, weekStart: string) =>
      `/booking/room/${roomId}/week?weekStart=${weekStart}`,

    CREATE: "/booking",
  },
};
