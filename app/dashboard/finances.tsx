/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Check, Download } from "lucide-react";
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { DatePickerWithRange } from "@/app/_components/ui/DatePickerWithRange";
import DialogDash from "./dialog";
import { deletePayment } from "../_actions/delete";
import { togglePaymentStatus } from "../_actions/toggleStatus";
import { IoClose } from "react-icons/io5";

interface FinancialItem {
  id: string;
  date: string;
  name: string;
  description: string;
  category: string;
  method: string;
  installment: string;
  paid: boolean;
  value: number;
  type: "pagar" | "receber";
}

interface FinancialDashboardProps {
  payables: FinancialItem[];
  receivables: FinancialItem[];
  fixedExpenses: string[];
  adverseExpenses: string[];
  revenues: string[];
  onDelete?: (id: string) => void;
  onAddPayment: (payment: FinancialItem) => void;
  onUpdatePayment: (updatedPayment: FinancialItem) => void;
}

export default function FinancialDashboard({
  payables,
  receivables,
  fixedExpenses,
  adverseExpenses,
  revenues,
  onDelete,
  onAddPayment,
  onUpdatePayment,
}: FinancialDashboardProps) {
  const [currentTab, setCurrentTab] = useState<"pagar" | "receber" | "all">("pagar");
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [fixedExpenseFilter, setFixedExpenseFilter] = useState<string | null>(null);
  const [adverseExpenseFilter, setAdverseExpenseFilter] = useState<string | null>(null);
  const [revenueFilter, setRevenueFilter] = useState<string | null>(null);

  const today = new Date();

  const currentData = React.useMemo(() => {
    let data =
      currentTab === "receber"
        ? receivables
        : currentTab === "pagar"
        ? payables
        : [...payables, ...receivables];

    // Aplicar filtro de data
    if (selectedRange?.from) {
      if (selectedRange.to) {
        data = data.filter((d) => {
          const dt = new Date(d.date);
          return dt >= selectedRange.from! && dt <= selectedRange.to!;
        });
      } else {
        data = data.filter((d) => {
          const dt = new Date(d.date);
          const from = selectedRange.from!;
          return (
            dt.getFullYear() === from.getFullYear() &&
            dt.getMonth() === from.getMonth() &&
            dt.getDate() === from.getDate()
          );
        });
      }
    } else if (!showAllMonths) {
      data = data.filter((d) => {
        const dt = new Date(d.date);
        return (
          dt.getMonth() === today.getMonth() &&
          dt.getFullYear() === today.getFullYear()
        );
      });
    }

    // Aplicar filtros de categoria
    if (fixedExpenseFilter && fixedExpenseFilter !== "all" && currentTab !== "receber") {
      data = data.filter((d) => d.category === fixedExpenseFilter);
    } else if (adverseExpenseFilter && adverseExpenseFilter !== "all" && currentTab !== "receber") {
      data = data.filter((d) => d.category === adverseExpenseFilter);
    } else if (revenueFilter && revenueFilter !== "all" && currentTab !== "pagar") {
      data = data.filter((d) => d.category === revenueFilter);
    }

    return data.sort((a, b) => a.date.localeCompare(b.date));
  }, [
    currentTab,
    payables,
    receivables,
    selectedRange,
    showAllMonths,
    fixedExpenseFilter,
    adverseExpenseFilter,
    revenueFilter,
  ]);

  const summary = React.useMemo(() => {
    return currentData.reduce(
      (acc, item) => {
        const v = Math.abs(item.value);
        if (item.paid) acc.paid += v;
        else if (new Date(item.date) < new Date()) acc.overdue += v;
        else acc.due += v;
        acc.total += v;
        return acc;
      },
      { paid: 0, due: 0, overdue: 0, total: 0 }
    );
  }, [currentData]);

  const inflow = React.useMemo(() => {
    if (currentTab !== "all") return 0;
    return currentData
      .filter((i) => i.type === "receber" && (i.paid || new Date(i.date) >= new Date()))
      .reduce((acc, i) => acc + i.value, 0);
  }, [currentData, currentTab]);

  const outflow = React.useMemo(() => {
    if (currentTab !== "all") return 0;
    return currentData
      .filter((i) => i.type === "pagar" && (i.paid || new Date(i.date) >= new Date()))
      .reduce((acc, i) => acc + Math.abs(i.value), 0);
  }, [currentData, currentTab]);

  const deletePay = async (id: string) => {
    try {
      const response = await deletePayment(id);
      if (response.success) {
        toast.success("Pagamento deletado com sucesso!");
        if (onDelete) onDelete(id);
      } else {
        toast.error(response.error || "Erro ao deletar pagamento.");
      }
    } catch (error) {
      console.error("Erro ao deletar pagamento:", error);
      toast.error("Erro ao deletar pagamento. Tente novamente.");
    }
  };

  const togglePay = async (id: string) => {
    try {
      const response = await togglePaymentStatus(id);
      if (response.success && response.transaction) {
        toast.success(`Pagamento marcado como ${response.transaction.paid ? "pago" : "não pago"}!`);
        onUpdatePayment({
          ...response.transaction,
          date: response.transaction.date.toISOString().split("T")[0],
          type: response.transaction.type as "pagar" | "receber",
          value: response.transaction.value,
        });
      } else {
        toast.error(response.error || "Erro ao atualizar status do pagamento.");
      }
    } catch (error) {
      console.error("Erro ao atualizar status do pagamento:", error);
      toast.error("Erro ao atualizar status do pagamento. Tente novamente.");
    }
  };

  const resetFilters = () => {
    setFixedExpenseFilter(null);
    setAdverseExpenseFilter(null);
    setRevenueFilter(null);
    setSelectedRange(undefined);
    setShowAllMonths(false);
  };

  const handleFixedExpenseChange = (value: string) => {
    setFixedExpenseFilter(value === "all" ? null : value);
    setAdverseExpenseFilter(null);
    setRevenueFilter(null);
  };

  const handleAdverseExpenseChange = (value: string) => {
    setAdverseExpenseFilter(value === "all" ? null : value);
    setFixedExpenseFilter(null);
    setRevenueFilter(null);
  };

  const handleRevenueChange = (value: string) => {
    setRevenueFilter(value === "all" ? null : value);
    setFixedExpenseFilter(null);
    setAdverseExpenseFilter(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-sm text-gray-800">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          onClick={() => setCurrentTab("all")}
          className={`w-full rounded border px-3 py-2 text-sm font-medium shadow-sm sm:w-auto ${
            currentTab === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-800"
          }`}
        >
          Todas as Contas
        </button>
        <DatePickerWithRange
          value={selectedRange}
          onChange={setSelectedRange}
          className="w-full sm:w-[300px]"
        />
        <button
          onClick={resetFilters}
          className="w-full rounded border bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 sm:w-auto"
        >
          Resetar Filtros
        </button>
      </div>

      <div className="mb-4 flex gap-2 text-center text-xs font-semibold uppercase">
        <div
          onClick={() => setCurrentTab("receber")}
          className={`flex-1 cursor-pointer rounded px-2 py-2 ${
            currentTab === "receber" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          Contas a Receber
        </div>
        <div
          onClick={() => setCurrentTab("pagar")}
          className={`flex-1 cursor-pointer rounded px-2 py-2 ${
            currentTab === "pagar" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          Contas a Pagar
        </div>
      </div>

      <aside className="mb-4 rounded-xl bg-white p-4 shadow-sm lg:hidden">
        <h2 className="mb-3 text-center text-sm font-bold uppercase text-gray-700">Resumo</h2>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-4">
          <div className="flex flex-col items-center py-2">
            <span className="text-blue-600 text-base font-semibold">Pago</span>
            <span className="text-blue-600 text-base">R$ {summary.paid.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="text-red-600 text-base font-semibold">Vencido</span>
            <span className="text-red-600 text-base">R$ {summary.overdue.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <span className="text-gray-800 text-base font-bold">Total</span>
            <span className="text-gray-800 text-base font-bold">R$ {summary.total.toFixed(2)}</span>
          </div>
        </div>
        {currentTab === "all" && (
          <>
            <hr className="my-2 border-gray-300" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex flex-col items-center py-2">
                <span className="text-green-600 text-base font-semibold">Entradas</span>
                <span className="text-green-600 text-base">R$ {inflow.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-center py-2">
                <span className="text-red-600 text-base font-semibold">Saídas</span>
                <span className="text-red-600 text-base">R$ {outflow.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </aside>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl bg-white shadow-sm">
          <div
            className={`flex flex-wrap items-center gap-2 px-4 py-2 text-sm font-semibold text-white ${
              currentTab === "pagar"
                ? "bg-red-600"
                : currentTab === "receber"
                ? "bg-emerald-600"
                : "bg-blue-600"
            }`}
          >
            <span className="flex-1 capitalize">
              {currentTab === "all"
                ? "Todas as Contas"
                : currentTab === "pagar"
                ? "Contas a Pagar"
                : "Contas a Receber"}
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              {(currentTab === "pagar" || currentTab === "all") && (
                <>
                  <Select onValueChange={handleFixedExpenseChange} value={fixedExpenseFilter || "all"}>
                    <SelectTrigger className="w-full sm:w-[200px] h-[26px] rounded bg-white/90 text-xs text-black">
                      <SelectValue placeholder="Despesas Fixas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                        className="text-sm text-gray-700 font-medium hover:bg-gray-100 cursor-pointer"
                      >
                        Despesas Fixas
                      </SelectItem>
                      {fixedExpenses.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="text-sm text-gray-700 font-medium hover:bg-gray-100 cursor-pointer"
                        >
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={handleAdverseExpenseChange} value={adverseExpenseFilter || "all"}>
                    <SelectTrigger className="w-full sm:w-[200px] h-[26px] rounded bg-white/90 text-xs text-black">
                      <SelectValue placeholder="Adversas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                        className="text-sm text-gray-700 font-medium hover:bg-gray-100 cursor-pointer"
                      >
                        Adversas
                      </SelectItem>
                      {adverseExpenses.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="text-sm text-gray-700 font-medium hover:bg-gray-100 cursor-pointer"
                        >
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {(currentTab === "receber" || currentTab === "all") && (
                <Select onValueChange={handleRevenueChange} value={revenueFilter || "all"}>
                  <SelectTrigger className="w-full sm:w-[200px] h-[26px] rounded bg-white/90 text-xs text-black">
                    <SelectValue placeholder="Receitas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      className="text-sm text-gray-700 font-medium hover:bg-gray-100 cursor-pointer"
                    >
                      Receitas
                    </SelectItem>
                    {revenues.map((opt) => (
                      <SelectItem
                        key={opt}
                        value={opt}
                        className="text-sm text-gray-700 font-medium hover:bg-gray-100 cursor-pointer"
                      >
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <DialogDash
              fixedExpenses={fixedExpenses}
              adverseExpenses={adverseExpenses}
              revenues={revenues}
              onAddPayment={onAddPayment}
            />

            <button className="rounded bg-white/20 p-1 hover:bg-white/30">
              <Download size={16} />
            </button>
          </div>

          <div className="hidden sm:block">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 text-xs text-gray-500">
                  <th className="px-3 py-2 sm:px-4">Data</th>
                  <th className="px-3 py-2 sm:px-4">Nome</th>
                  <th className="hidden md:table-cell px-3 py-2 sm:px-4">Descrição</th>
                  <th className="hidden lg:table-cell px-3 py-2 sm:px-4">Categoria</th>
                  <th className="hidden lg:table-cell px-3 py-2 sm:px-4">Método</th>
                  <th className="px-3 py-2 sm:px-4">Parcela</th>
                  <th className="px-3 py-2 sm:px-4">Pago</th>
                  <th className="px-3 py-2 text-right sm:px-4">Valor</th>
                  <th className="px-3 py-2 text-right sm:px-4"></th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-sm sm:text-md sm:px-4">
                      {new Date(item.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-2 text-base font-semibold sm:text-sm sm:px-4">{item.name}</td>
                    <td className="hidden md:table-cell px-3 py-2 text-base sm:text-sm sm:px-4">{item.description}</td>
                    <td className="hidden lg:table-cell px-3 py-2 text-font font-semibold sm:text-sm sm:px-4">{item.category}</td>
                    <td className="hidden lg:table-cell px-3 py-2 text-base sm:text-sm sm:px-4">{item.method}</td>
                    <td className="whitespace-nowrap px-3 font-semibold py-2 text-base sm:text-sm sm:px-4">{item.installment}</td>
                    <td className="px-3 py-2 text-center sm:px-4">
                      <div onClick={() => togglePay(item.id)} className="cursor-pointer pr-20">
                        {item.paid ? (
                          <Check className="mx-auto h-6 w-6 text-green-600 sm:h-6 sm:w-6" />
                        ) : (
                          <IoClose className="mx-auto h-6 w-6 text-red-500 sm:h-5 sm:w-5" />
                        )}
                      </div>
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-2 text-right text-base font-semibold sm:text-sm sm:px-4 ${
                        item.value < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      R$ {Math.abs(item.value).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right sm:px-4">
                      <div
                        onClick={() => deletePay(item.id)}
                        className="cursor-pointer text-red-700 sm:pl-5"
                      >
                        <FaRegTrashAlt className="sm:h-4 sm:w-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-xl bg-white p-4 text-xs font-semibold shadow-sm hidden sm:block">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="text-center text-sm font-bold uppercase text-gray-700">Resumo</h2>
            <div className="flex justify-between py-2">
              <span className="text-blue-600 text-[17px]">Pago</span>
              <span className="text-blue-600 text-[17px]">R$ {summary.paid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-red-600 text-[17px]">Vencido</span>
              <span className="text-red-600 text-[17px]">R$ {summary.overdue.toFixed(2)}</span>
            </div>
            <hr className="my-1 border-gray-300" />
            <div className="flex justify-between font-bold">
              <span className="text-[17px]">Total</span>
              <span className="text-[17px]">R$ {summary.total.toFixed(2)}</span>
            </div>
          </div>

          {currentTab === "all" && (
            <>
              <hr className="my-2 border-gray-300" />
              <div className="flex justify-between">
                <span>Entradas</span>
                <span className="text-green-600">R$ {inflow.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Saídas</span>
                <span className="text-red-600">R$ {outflow.toFixed(2)}</span>
              </div>
            </>
          )}
        </aside>

        <div className="block sm:hidden">
          {currentData.map((item) => (
            <div
              key={item.id}
              className="mb-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div onClick={() => deletePay(item.id)} className="cursor-pointer text-red-700">
                  <FaRegTrashAlt size={18} />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-md">
                <div>
                  <span className="font-medium">Descrição:</span> {item.description}
                </div>
                <div>
                  <span className="font-medium text-md">Categoria:</span> {item.category}
                </div>
                <div>
                  <span className="font-medium">Método:</span> {item.method}
                </div>
                <div>
                  <span className="font-medium">Parcela:</span> {item.installment}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Pago:</span>
                  <div onClick={() => togglePay(item.id)} className="cursor-pointer pt-[3px]">
                    {item.paid ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <IoClose className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                </div>
                <div className={`font-semibold ${item.value < 0 ? "text-red-600" : "text-green-600"}`}>
                  <span className="font-medium">Valor:</span> R$ {Math.abs(item.value).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}