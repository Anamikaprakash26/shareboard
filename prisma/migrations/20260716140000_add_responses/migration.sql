-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "sharedLinkId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Response_sharedLinkId_idx" ON "Response"("sharedLinkId");

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_sharedLinkId_fkey" FOREIGN KEY ("sharedLinkId") REFERENCES "SharedLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

