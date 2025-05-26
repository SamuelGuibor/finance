"use server";

import { db } from "@/app/_lib/prisma";

interface CreatePaymentProps {
  name: string;
  date: string;
  description: string;
  category: string;
  method: string;
  installment: string;
  paid: boolean;
  value: string; // Recebe como string do formulário
  type: "pagar" | "receber";
}

export async function CreatePayment(data: CreatePaymentProps) {
  try {
    const parsedValue = parseFloat(data.value);
    if (isNaN(parsedValue)) {
      return { success: false, error: "Valor inválido" };
    }

    const transaction = await db.transaction.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        method: data.method,
        installment: data.installment,
        paid: data.paid,
        value: parsedValue,
        type: data.type,
      },
    });

    return { success: true, transaction };
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return { success: false, error: "Falha ao criar transação" };
  }
}