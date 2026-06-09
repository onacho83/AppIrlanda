/*
  Warnings:

  - You are about to drop the column `order_id` on the `invoices` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_order_id_fkey";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "order_id",
ADD COLUMN     "qr_data" TEXT,
ALTER COLUMN "invoice_number" SET DATA TYPE TEXT,
ALTER COLUMN "cae" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "invoice_id" UUID;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
