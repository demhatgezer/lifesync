/*
  Warnings:

  - Made the column `category` on table `Expense` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "category" SET NOT NULL;

-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "calories" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "tags" DROP NOT NULL,
ALTER COLUMN "tags" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "step_goal" INTEGER NOT NULL DEFAULT 10000,
    "sleep_goal" DECIMAL(3,1) NOT NULL DEFAULT 8.0,
    "exercise_goal" INTEGER NOT NULL DEFAULT 60,
    "spending_limit" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Goal_user_id_key" ON "Goal"("user_id");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
