"use client";
import { useState } from "react";
import FinancialDashboard from "@/app/dashboard/finances";

export default function Home() {
  // ---------- Dropdown options ----------
  const fixedExpenses = [
    "salarios",
    "folha de pagamento",
    "vt",
    "vr",
    "internet",
    "luz",
    "agua",
    "bebidas",
    "papelaria",
    "tafego pago",
    "assinaturas",
  ];
  const adverseExpenses = ["equipamento"];
  const revenues = [
    "ações previdenciarias",
    "ações securitarias",
    "açoes judiciais",
    "vendas de processos",
    "processos administrativos",
    "processo dpvat",
  ];

  // ---------- Dados fictícios ----------
  const [payables] = useState([
    { date: "2025-05-05", description: "Aluguel", category: "Aluguel", method: "Pix", installment: "10/12", paid: true, value: -1200 },
    { date: "2025-05-12", description: "Energia", category: "Energia", method: "Débito", installment: "1/1", paid: false, value: -350 },
    { date: "2025-04-15", description: "Internet", category: "Utilitários", method: "Crédito", installment: "1/1", paid: false, value: -120 },
  ]);
  const [receivables] = useState([
    { date: "2025-05-10", description: "Venda Produto A", category: "Vendas", method: "Pix", installment: "1/1", paid: true, value: 800 },
    { date: "2025-05-20", description: "Serviço Marketing", category: "Serviços", method: "Transf.", installment: "1/1", paid: false, value: 1500 },
  ]);

  return (
    <FinancialDashboard
      payables={payables}
      receivables={receivables}
      fixedExpenses={fixedExpenses}
      adverseExpenses={adverseExpenses}
      revenues={revenues}
    />
  );
}