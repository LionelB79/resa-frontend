export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  equipements: { name: string }[];
}
