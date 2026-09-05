# 📚 Library OPAC

A web-based **Online Public Access Catalog (OPAC)** system designed to help libraries manage books, book copies, borrowing transactions, reservations, and library users.

The system provides separate functionality for **Students, Librarians, and Administrators**.

## 🚀 Features

### 👨‍🎓 Student
- User registration and login
- Browse available books
- Search books
- View book details
- View authors and categories
- Borrow available book copies
- Reserve unavailable books
- View active borrowings
- View borrowing due dates
- Cancel pending reservations

### 📚 Librarian
- Librarian authentication
- Book management
- Add, edit, and delete books
- Upload book cover images
- Automatic author creation
- Automatic category creation
- Manage physical book copies
- Generate accession numbers
- Update book copy status
- Manage borrowing transactions
- Return borrowed books
- Manage reservations
- Fulfill reservations
- View borrowing reports
- Search and filter borrowing records
- Export borrowing reports to CSV

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Student
- Librarian
- Administrator
- Protected API routes

## 🛠️ Technologies Used

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Multer

### Database
- PostgreSQL
- Prisma ORM

## 📂 Project Structure

```text
LIBRARY-OPAC/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.tsx
│   └── App.css
│
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── generated/
│   │   ├── prisma.ts
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── uploads/
│   │   └── books/
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── package.json
└── README.md
