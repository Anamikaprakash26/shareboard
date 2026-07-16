-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "SharedLink" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "passwordHash" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkView" (
    "id" TEXT NOT NULL,
    "sharedLinkId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "ipHash" TEXT,
    "hits" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedLink_slug_key" ON "SharedLink"("slug");

-- CreateIndex
CREATE INDEX "LinkView_sharedLinkId_idx" ON "LinkView"("sharedLinkId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkView_sharedLinkId_visitorId_key" ON "LinkView"("sharedLinkId", "visitorId");

-- AddForeignKey
ALTER TABLE "LinkView" ADD CONSTRAINT "LinkView_sharedLinkId_fkey" FOREIGN KEY ("sharedLinkId") REFERENCES "SharedLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

