export interface Booking {
  id?: string;
  roomId: string;
  bookingTitle: string;
  userEmail: string;
  startTime: Date;
  endTime: Date;
}
