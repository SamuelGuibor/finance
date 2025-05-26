"use server";

import { db } from "@/app/_lib/prisma";

export async function deletePayment(id: string) {
  try {
    await db.transaction.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    return { success: false, error: "Falha ao deletar transação" };
  }
}