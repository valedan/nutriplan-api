-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User.id_index" ON "User"("id");
