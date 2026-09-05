import api from "./api";

export interface BorrowingUser {
  id: number;
  name: string;
  email: string;
}

export interface BorrowingBook {
  id: number;
  title: string;
  isbn: string | null;
  author: {
    id: number;
    name: string;
  };
}

export interface BorrowingCopy {
  id: number;
  accessionNumber: string;
  status:
    | "AVAILABLE"
    | "BORROWED"
    | "LOST"
    | "DAMAGED";
  shelfLocation: string | null;
  book: BorrowingBook;
}

export interface Borrowing {
  id: number;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;

  user: BorrowingUser;

  bookCopy: BorrowingCopy;
}

/* =========================
   GET ALL BORROWINGS
========================= */

export const getBorrowings =
  async (): Promise<Borrowing[]> => {
    const response =
      await api.get("/borrowings");

    return response.data;
  };

/* =========================
   RETURN BOOK
========================= */

export const returnBorrowing =
  async (id: number) => {
    const response =
      await api.put(
        `/borrowings/${id}/return`
      );

    return response.data;
  };