"use client";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreatePayment } from "@/app/_actions/createPayment";

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

interface DialogDashProps {
  fixedExpenses: string[];
  adverseExpenses: string[];
  revenues: string[];
  onAddPayment: (payment: FinancialItem) => void;
}

export default function DialogDash({
  fixedExpenses,
  adverseExpenses,
  revenues,
  onAddPayment,
}: DialogDashProps) {
  const [type, setType] = useState<"pagar" | "receber">("pagar");
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [installment, setInstallment] = useState<string>("1/1");
  const [paid, setPaid] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const categories = type === "pagar" ? [...fixedExpenses, ...adverseExpenses] : revenues;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !date || !description || !category || !method || !installment || !value) {
      setError("Por favor, preencha todos os campos corretamente.");
      return;
    }

    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      setError("O valor deve ser um número válido.");
      return;
    }

    const response = await CreatePayment({
      name,
      date,
      description,
      category,
      method,
      installment,
      paid,
      value: parsedValue.toString(), // Envia como string para a ação
      type,
    });

    if (response.success && response.transaction) {
      const newPayment: FinancialItem = {
        id: response.transaction.id,
        name,
        date,
        description,
        category,
        method,
        installment,
        paid,
        value: parsedValue,
        type,
      };
      onAddPayment(newPayment);
      setName("");
      setDate("");
      setDescription("");
      setCategory("");
      setMethod("");
      setInstallment("1/1");
      setPaid(false);
      setValue("");
      setError(null);
      setOpen(false);
    } else {
      setError(response.error || "Erro ao criar a transação.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center w-[160px] h-[26px] gap-1 rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30">
          <Plus size={14} /> Novo Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Pagamento</DialogTitle>
          <DialogDescription>Preencha os detalhes da nova transação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "pagar" | "receber")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pagar">Contas a Pagar</option>
              <option value="receber">Contas a Receber</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Selecione uma categoria
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="method">Método de Pagamento</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Selecione um método
              </option>
              <option value="Pix">Pix</option>
              <option value="Boleto">Boleto</option>
              <option value="Cartão">Cartão</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="installment">Parcela</Label>
            <Input
              id="installment"
              value={installment}
              onChange={(e) => setInstallment(e.target.value)}
              placeholder="Ex: 1/1"
              className="w-full"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="value">Valor (BRL)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="paid"
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="paid">Pago</Label>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}