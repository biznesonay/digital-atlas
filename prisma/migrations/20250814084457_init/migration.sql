-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "refreshToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Object" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "infrastructureTypeId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "googleMapsUrl" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "imageUrl" TEXT,
    "contactPhones" TEXT,
    "geocodingStatus" TEXT DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Object_infrastructureTypeId_fkey" FOREIGN KEY ("infrastructureTypeId") REFERENCES "InfrastructureType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Object_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObjectTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "objectId" INTEGER NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ObjectTranslation_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Object" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InfrastructureType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InfrastructureTypeTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "infrastructureTypeId" INTEGER NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "InfrastructureTypeTranslation_infrastructureTypeId_fkey" FOREIGN KEY ("infrastructureTypeId") REFERENCES "InfrastructureType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Region" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RegionTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "RegionTranslation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriorityDirection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ObjectPriorityDirection" (
    "objectId" INTEGER NOT NULL,
    "priorityDirectionId" INTEGER NOT NULL,

    PRIMARY KEY ("objectId", "priorityDirectionId"),
    CONSTRAINT "ObjectPriorityDirection_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Object" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ObjectPriorityDirection_priorityDirectionId_fkey" FOREIGN KEY ("priorityDirectionId") REFERENCES "PriorityDirection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectTranslation_objectId_languageCode_key" ON "ObjectTranslation"("objectId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "InfrastructureTypeTranslation_infrastructureTypeId_languageCode_key" ON "InfrastructureTypeTranslation"("infrastructureTypeId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "RegionTranslation_regionId_languageCode_key" ON "RegionTranslation"("regionId", "languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "PriorityDirection_name_key" ON "PriorityDirection"("name");
