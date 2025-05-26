"use client";

import FinancialDashboard from "@/app/dashboard/finances";
import { useState, useEffect } from "react";
import { getPayments } from "@/app/_actions/getPayments";

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

export default function Home() {
  const fixedExpenses = [
    "Salarios",
    "Folha de pagamento",
    "Vt",
    "Vr",
    "Internet",
    "Luz",
    "Agua",
    "Bebidas",
    "Papelaria",
    "Tafego pago",
    "Assinaturas",
  ];
  const adverseExpenses = ["Equipamento"];
  const revenues = [
    "Ações Previdenciarias",
    "Ações Securitarias",
    "Ações Judiciais",
    "Vendas de Processos",
    "Processos Administrativos",
    "Processo Dpvat",
  ];

  const [payables, setPayables] = useState<FinancialItem[]>([]);
  const [receivables, setReceivables] = useState<FinancialItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPayments({});
        setPayables(data.filter((item) => item.type === "pagar"));
        setReceivables(data.filter((item) => item.type === "receber"));
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      }
    }
    fetchData();
  }, []);

  const handleDelete = (id: string) => {
    setPayables(payables.filter((item) => item.id !== id));
    setReceivables(receivables.filter((item) => item.id !== id));
  };

  const handleAddPayment = (newPayment: FinancialItem) => {
    if (newPayment.type === "pagar") {
      setPayables([...payables, newPayment]);
    } else {
      setReceivables([...receivables, newPayment]);
    }
  };

  const handleUpdatePayment = (updatedPayment: FinancialItem) => {
    if (updatedPayment.type === "pagar") {
      setPayables(
        payables.map((item) =>
          item.id === updatedPayment.id ? updatedPayment : item
        )
      );
    } else {
      setReceivables(
        receivables.map((item) =>
          item.id === updatedPayment.id ? updatedPayment : item
        )
      );
    }
  };

  return (
    <FinancialDashboard
      payables={payables}
      receivables={receivables}
      fixedExpenses={fixedExpenses}
      adverseExpenses={adverseExpenses}
      revenues={revenues}
      onDelete={handleDelete}
      onAddPayment={handleAddPayment}
      onUpdatePayment={handleUpdatePayment}
    />
  );
}