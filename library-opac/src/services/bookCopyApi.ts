import api from "./api";

export interface BookCopy {
  id: number;
  bookId: number;
  accessionNumber: string;
  status:
    | "AVAILABLE"
    | "BORROWED"
    | "LOST"
    | "DAMAGED";
  shelfLocation: string | null;
}

export const getAllBookCopies = async (): Promise<
  BookCopy[]
> => {
  const response = await api.get("/book-copies");

  return response.data;
};

export const getBookCopies = async (
  bookId: number
): Promise<BookCopy[]> => {
  const response = await api.get(
    `/book-copies/book/${bookId}`
  );

  return response.data;
};

export const createBookCopies = async (data: {
  bookId: number;
  quantity: number;
  startingAccessionNumber: string;
  shelfLocation?: string;
}) => {
  const response = await api.post(
    "/book-copies",
    data
  );

  return response.data;
};

export const updateBookCopy = async (
  id: number,
  data: {
    accessionNumber: string;
    shelfLocation: string;
    status: BookCopy["status"];
  }
) => {
  const response = await api.put(
    `/book-copies/${id}`,
    data
  );

  return response.data;
};

export const deleteBookCopy = async (
  id: number
) => {
  const response = await api.delete(
    `/book-copies/${id}`
  );

  return response.data;
};