"use server";

import { db } from "@/app/_lib/prisma";

interface CreatePaymentProps {
  date: string;
  description: string;
  category: string;
  method: string;
  installment: string;
  paid: boolean;
  value: number;
}

export async function CreatePayment(data: CreatePaymentProps) {
  try {
    // Find the category by name
    const category = await db.category.findFirst({
      where: {
        name: data.category,
      },
    });

    // Check if the category exists
    if (!category) {
      throw new Error(`Category with name "${data.category}" not found.`);
    }

    // Create the transaction with the category ID
    await db.transaction.create({
      data: {
        date: new Date(data.date),
        description: data.description,
        category: {
          connect: {
            id: category.id, // Use the category's ID for the connect operation
          },
        },
        method: data.method,
        installment: data.installment,
        paid: data.paid,
        value: data.value,
      },
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction. Ensure the category exists.");
  }
}