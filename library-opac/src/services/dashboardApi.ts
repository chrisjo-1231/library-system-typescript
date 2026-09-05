import api from "./api";

export interface LibrarianStats {
  totalBooks: number;
  activeBorrowings: number;
  pendingReservations: number;
  totalStudents: number;
}

export const getLibrarianStats =
  async (): Promise<LibrarianStats> => {
    const response = await api.get(
      "/dashboard/librarian"
    );

    return response.data;
  };