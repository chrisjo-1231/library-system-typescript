import api from "./api";

export interface Author {
  id: number;
  name: string;
  biography: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface BookCopy {
  id: number;
  accessionNumber: string;
  status:
    | "AVAILABLE"
    | "BORROWED"
    | "LOST"
    | "DAMAGED";
  shelfLocation: string | null;
}

export interface Book {
  id: number;
  title: string;
  isbn: string | null;
  description: string | null;
  publisher: string | null;
  publicationYear: number | null;
  coverImage: string | null;

  author: Author;
  category: Category;

  copies: BookCopy[];
}

/* ================================
   GET ALL BOOKS
================================ */

export const getBooks = async (): Promise<Book[]> => {
  const response = await api.get("/books");

  return response.data;
};

/* ================================
   GET SINGLE BOOK
================================ */

export const getBook = async (
  id: number
): Promise<Book> => {
  const response = await api.get(`/books/${id}`);

  return response.data;
};

/* ================================
   GET AUTHORS
================================ */

export const getAuthors = async (): Promise<
  Author[]
> => {
  const response = await api.get("/authors");

  return response.data;
};

/* ================================
   GET CATEGORIES
================================ */

export const getCategories = async (): Promise<
  Category[]
> => {
  const response = await api.get("/categories");

  return response.data;
};

/* ================================
   CREATE BOOK
================================ */

export interface CreateBookData {
  title: string;
  isbn?: string;
  description?: string;
  publisher?: string;
  publicationYear?: number;
  coverImage?: string;
  authorId: number;
  categoryId: number;
}

export const createBook = async (
  data: CreateBookData
): Promise<Book> => {
  const response = await api.post(
    "/books",
    data
  );

  return response.data.book ?? response.data;
};

/* ================================
   DELETE BOOK
================================ */

export const deleteBook = async (
  id: number
) => {
  const response = await api.delete(
    `/books/${id}`
  );

  return response.data;
};