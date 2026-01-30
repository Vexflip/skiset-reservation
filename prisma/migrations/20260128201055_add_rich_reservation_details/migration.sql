-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalPrice" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Reservation" ("createdAt", "email", "endDate", "firstName", "id", "lastName", "notes", "phone", "startDate", "status", "updatedAt") SELECT "createdAt", "email", "endDate", "firstName", "id", "lastName", "notes", "phone", "startDate", "status", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE TABLE "new_ReservationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "productName" TEXT NOT NULL DEFAULT 'Unknown Product',
    "price" DECIMAL NOT NULL DEFAULT 0,
    "image" TEXT,
    "bootsImage" TEXT,
    "helmetImage" TEXT,
    "options" TEXT,
    "size" TEXT,
    "level" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ReservationItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReservationItem" ("category", "id", "level", "quantity", "reservationId", "size") SELECT "category", "id", "level", "quantity", "reservationId", "size" FROM "ReservationItem";
DROP TABLE "ReservationItem";
ALTER TABLE "new_ReservationItem" RENAME TO "ReservationItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
