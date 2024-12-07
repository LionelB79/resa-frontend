export interface Room {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  equipements: { name: string }[];
}
