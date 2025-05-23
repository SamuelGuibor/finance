"use client";
import { Check, Circle, Download, Plus } from "lucide-react";
import { useState } from "react";

export default function Home() {
  // ---------- Estado ----------
  const [currentTab, setCurrentTab] = useState<"pagar" | "receber" | "all">("pagar");
  const [month, setMonth] = useState(new Date());
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [showAllMonths, setShowAllMonths] = useState(false);

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

  // ---------- Navegação de mês ----------
  const nextMonth = () => setMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const prevMonth = () => setMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const monthLabel = month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // ---------- Combinação e filtros ----------
  const currentData = (() => {
    let data = currentTab === "receber" ? receivables : currentTab === "pagar" ? payables : [...payables, ...receivables];
    if (dateFilter) data = data.filter((d) => d.date === dateFilter);
    if (!showAllMonths) {
      data = data.filter((d) => {
        const dt = new Date(d.date);
        return dt.getMonth() === month.getMonth() && dt.getFullYear() === month.getFullYear();
      });
    }
    return data.sort((a, b) => a.date.localeCompare(b.date));
  })();

  // ---------- Totais ----------
  const summary = currentData.reduce(
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
  
const inflow = currentTab === "all"
  ? currentData
      .filter(i => i.value > 0 && (i.paid || new Date(i.date) >= new Date()))
      .reduce((acc, i) => acc + i.value, 0)
  : 0;

const outflow = currentTab === "all"
  ? currentData
      .filter(i => i.value < 0 && (i.paid || new Date(i.date) >= new Date()))
      .reduce((acc, i) => acc + Math.abs(i.value), 0)
  : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-sm text-gray-800">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCurrentTab("all")}
          className={`rounded border px-3 py-1 shadow-sm ${currentTab === "all" ? "bg-blue-600 text-white" : "bg-white"}`}
        >
          Todas as Contas
        </button>

        <input
          type="date"
          value={dateFilter ?? ""}
          onChange={(e) => setDateFilter(e.target.value || null)}
          className="rounded border bg-white px-3 py-1 shadow-sm"
        />

        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={showAllMonths}
            onChange={() => setShowAllMonths(!showAllMonths)}
          />
          Ver todos os meses
        </label>

        <div className="ml-auto flex items-center gap-1">
          <button onClick={prevMonth} className="rounded bg-gray-200 px-2">&#8249;</button>
          <span className="rounded bg-white px-4 py-1 shadow-sm capitalize">{monthLabel}</span>
          <button onClick={nextMonth} className="rounded bg-gray-200 px-2">&#8250;</button>
        </div>
      </div>

      <div className="mb-3 flex gap-4 text-center text-xs font-semibold uppercase">
        <div
          onClick={() => setCurrentTab("receber")}
          className={`flex-1 cursor-pointer rounded px-2 py-1 ${currentTab === "receber" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}
        >
          Contas a Receber
        </div>
        <div
          onClick={() => setCurrentTab("pagar")}
          className={`flex-1 cursor-pointer rounded px-2 py-1 ${currentTab === "pagar" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"}`}
        >
          Contas a Pagar
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-xl bg-white shadow-sm">
          <div
            className={`flex flex-wrap items-center gap-2 px-4 py-2 text-sm font-semibold text-white ${currentTab === "pagar" ? "bg-red-600" : currentTab === "receber" ? "bg-emerald-600" : "bg-blue-600"
              }`}
          >
            <span className="flex-1 capitalize">
              {currentTab === "all" ? "Todas as Contas" : currentTab === "pagar" ? "Contas a Pagar" : "Contas a Receber"}
            </span>
            {(currentTab === "pagar" || currentTab === "all") && (
              <>
                <select className="rounded bg-white/90 px-2 py-1 text-xs text-black">
                  <option disabled selected>Despesas Fixas</option>
                  {fixedExpenses.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>

                <select className="rounded bg-white/90 px-2 py-1 text-xs text-black">
                  <option disabled selected>Adversas</option>
                  {adverseExpenses.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </>
            )}

            {(currentTab === "receber" || currentTab === "all") && (
              <select className="rounded bg-white/90 px-2 py-1 text-xs text-black">
                <option disabled selected>Receitas</option>
                {revenues.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            )}
            <button className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30">
              <Plus size={14} /> Novo Pagamento
            </button>
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
                <th className="px-4 py-2">Forma</th>
                <th className="px-4 py-2">Parcela</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">{item.date}</td>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className="px-4 py-2">{item.method}</td>
                  <td className="px-4 py-2">{item.installment}</td>
                  <td className="px-4 py-2">
                    {item.paid ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Check size={14} /> Pago
                      </span>
                    ) : new Date(item.date) < new Date() ? (
                      <span className="flex items-center gap-1 text-red-500">
                        <Circle size={10} fill="currentColor" /> Atrasado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Circle size={10} fill="currentColor" /> Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {(item.value < 0 ? "-" : "") + Math.abs(item.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold">Resumo</h2>
          <ul className="space-y-1 text-xs">
            <li className="flex justify-between"><span>Total</span><span>{summary.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></li>
            <li className="flex justify-between text-emerald-600"><span>Pagos</span><span>{summary.paid.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></li>
            <li className="flex justify-between text-gray-500"><span>Pendentes</span><span>{summary.due.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></li>
            <li className="flex justify-between text-red-500"><span>Atrasados</span><span>{summary.overdue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></li>
            {currentTab === "all" && (
              <>
                <li className="flex justify-between text-emerald-600">
                  <span>Entradas</span>
                  <span>{inflow.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </li>
                <li className="flex justify-between text-red-500">
                  <span>Saídas</span>
                  <span>{outflow.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </div>
  );
}