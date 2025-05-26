"use server";

import { db } from "@/app/_lib/prisma";

export async function togglePaymentStatus(id: string) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return { success: false, error: "Transação não encontrada" };
    }

    const updatedTransaction = await db.transaction.update({
      where: { id },
      data: { paid: !transaction.paid },
    });

    return { success: true, transaction: updatedTransaction };
  } catch (error) {
    console.error("Erro ao atualizar status da transação:", error);
    return { success: false, error: "Falha ao atualizar status da transação" };
  }
}