/*
  Warnings:

  - The primary key for the `Transaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoryId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `value` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `date` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `method` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `installment` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `paid` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `value` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_pkey",
DROP COLUMN "categoryId",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "method" SET NOT NULL,
ALTER COLUMN "installment" SET NOT NULL,
ALTER COLUMN "paid" SET NOT NULL,
ALTER COLUMN "paid" SET DEFAULT false,
ALTER COLUMN "value" SET NOT NULL,
ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION,
ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Transaction_id_seq";

-- DropTable
DROP TABLE "Category";
