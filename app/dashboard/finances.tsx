"use client";

import { Check, Circle, Download } from "lucide-react";
import React, { useState } from "react";
import { DateRange } from "react-day-picker";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

import { DatePickerWithRange } from "@/app/_components/ui/DatePickerWithRange"; // Caminho corrigido
import DialogDash from "./dialog";

interface FinancialItem {
  date: string;
  description: string;
  category: string;
  method: string;
  installment: string;
  paid: boolean;
  value: number;
}

interface FinancialDashboardProps {
  payables: FinancialItem[];
  receivables: FinancialItem[];
  fixedExpenses: string[];
  adverseExpenses: string[];
  revenues: string[];
}

export default function FinancialDashboard({
  payables,
  receivables,
  fixedExpenses,
  adverseExpenses,
  revenues,
}: FinancialDashboardProps) {
  const [currentTab, setCurrentTab] = useState<"pagar" | "receber" | "all">("pagar");
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);

  const today = new Date();

  const currentData = React.useMemo(() => {
    let data =
      currentTab === "receber"
        ? receivables
        : currentTab === "pagar"
          ? payables
          : [...payables, ...receivables];

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

    return data.sort((a, b) => a.date.localeCompare(b.date));
  }, [currentTab, payables, receivables, selectedRange, showAllMonths, today]);

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
      .filter((i) => i.value > 0 && (i.paid || new Date(i.date) >= new Date()))
      .reduce((acc, i) => acc + i.value, 0);
  }, [currentData, currentTab]);

  const outflow = React.useMemo(() => {
    if (currentTab !== "all") return 0;
    return currentData
      .filter((i) => i.value < 0 && (i.paid || new Date(i.date) >= new Date()))
      .reduce((acc, i) => acc + Math.abs(i.value), 0);
  }, [currentData, currentTab]);

  const handleAddTransaction = async () => {
    // Sua lógica aqui
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-sm text-gray-800">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCurrentTab("all")}
          className={`rounded border px-3 py-1 shadow-sm ${currentTab === "all" ? "bg-blue-600 text-white" : "bg-white"
            }`}
        >
          Todas as Contas
        </button>

        <DatePickerWithRange
          value={selectedRange}
          onChange={setSelectedRange}
          className="min-w-[300px]"
        />

        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={showAllMonths}
            onChange={() => setShowAllMonths(!showAllMonths)}
          />
          Ver todos os meses
        </label>
      </div>

      <div className="mb-3 flex gap-4 text-center text-xs font-semibold uppercase">
        <div
          onClick={() => setCurrentTab("receber")}
          className={`flex-1 cursor-pointer rounded px-2 py-1 ${currentTab === "receber"
              ? "bg-emerald-600 text-white"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          Contas a Receber
        </div>
        <div
          onClick={() => setCurrentTab("pagar")}
          className={`flex-1 cursor-pointer rounded px-2 py-1 ${currentTab === "pagar"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-600"
            }`}
        >
          Contas a Pagar
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl bg-white shadow-sm">
          <div
            className={`flex flex-wrap items-center gap-2 px-4 py-2 text-sm font-semibold text-white ${currentTab === "pagar"
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

            {(currentTab === "pagar" || currentTab === "all") && (
              <>
                <Select>
                  <SelectTrigger className="w-[150px] h-[26px] rounded bg-white/90 text-xs text-black">
                    <SelectValue placeholder="Despesas Fixas" />
                  </SelectTrigger>
                  <SelectContent>
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

                <Select>
                  <SelectTrigger className="w-[150px] h-[26px] rounded bg-white/90 text-xs text-black">
                    <SelectValue placeholder="Adversas" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Select>
                <SelectTrigger className="w-[150px] h-[26px] rounded bg-white/90 text-xs text-black">
                  <SelectValue placeholder="Receitas" />
                </SelectTrigger>
                <SelectContent>
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

            <DialogDash
              fixedExpenses={fixedExpenses}
              adverseExpenses={adverseExpenses}
              revenues={revenues}
              onAddTransaction={handleAddTransaction}
            />

            <button className="rounded bg-white/20 p-1 hover:bg-white/30">
              <Download size={16} />
            </button>
          </div>

          <table className="w-full table-fixed border-collapse text-left rounded-xl">
            <thead>
              <tr className="bg-gray-100 text-xs text-gray-500">
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Descrição</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2">Método</th>
                <th className="px-4 py-2">Parcela</th>
                <th className="px-4 py-2">Pago</th>
                <th className="px-4 py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr
                  key={index}
                  className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-4 py-2 text-xs">
                    {new Date(item.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2">{item.method}</td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {item.installment}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {item.paid ? (
                      <Check className="mx-auto h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="mx-auto h-4 w-4 text-gray-400" />
                    )}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-2 text-right font-semibold ${item.value < 0 ? "text-red-600" : "text-green-600"
                      }`}
                  >
                    R$ {Math.abs(item.value).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="rounded-xl bg-white p-4 text-xs font-semibold shadow-sm">
          <div className="mb-3 flex flex-col gap-1">
            <h2 className="text-center text-sm font-bold uppercase text-gray-700">
              Resumo
            </h2>

            <div className="flex justify-between">
              <span>Pago</span>
              <span>R$ {summary.paid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>À Vencer</span>
              <span>R$ {summary.due.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Vencido</span>
              <span>R$ {summary.overdue.toFixed(2)}</span>
            </div>
            <hr className="my-1 border-gray-300" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>R$ {summary.total.toFixed(2)}</span>
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
      </div>
    </div>
  );
}
