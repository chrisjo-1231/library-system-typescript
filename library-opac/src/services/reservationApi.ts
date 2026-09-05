import api from "./api";

export interface ReservationUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ReservationBook {
  id: number;
  title: string;
  isbn: string | null;
  author: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
}

export interface Reservation {
  id: number;
  reservedAt: string;
  status:
    | "PENDING"
    | "FULFILLED"
    | "CANCELLED";

  user: ReservationUser;
  book: ReservationBook;
}

/* =========================
   GET ALL RESERVATIONS
========================= */

export const getReservations =
  async (): Promise<Reservation[]> => {
    const response =
      await api.get("/reservations");

    return response.data;
  };

/* =========================
   FULFILL RESERVATION
========================= */

export const fulfillReservation =
  async (id: number) => {
    const response =
      await api.put(
        `/reservations/${id}/fulfill`
      );

    return response.data;
  };