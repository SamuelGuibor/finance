"use server";

import { db } from "@/app/_lib/prisma";

interface FinancialItem {
  id: string;
  name: string;
  date: string;
  description: string;
  category: string;
  method: string;
  installment: string;
  paid: boolean;
  value: number;
  type: "pagar" | "receber";
}

interface GetPaymentsProps {
  type?: "pagar" | "receber";
}

export async function getPayments({ type }: GetPaymentsProps = {}): Promise<FinancialItem[]> {
  try {
    const transactions = await db.transaction.findMany({
      where: type ? { type } : {},
      orderBy: { date: "asc" },
    });

    return transactions.map((t) => ({
      id: t.id,
      name: t.name,
      date: t.date.toISOString().split("T")[0],
      description: t.description,
      category: t.category,
      method: t.method,
      installment: t.installment,
      paid: t.paid,
      value: t.value,
      type: t.type as "pagar" | "receber",
    }));
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return [];
  }
}