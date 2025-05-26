
"use client";
import { Button } from "@/app/_components/ui/button"; // Assumindo que você tem um componente Button
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
interface DialogDashProps {
  fixedExpenses: string[];
  adverseExpenses: string[];
  revenues: string[];
  onAddTransaction: (transaction: {
    date: string;
    description: string;
    category: string;
    method: string;
    installment: string;
    paid: boolean;
    value: number;
    type: "pagar" | "receber";
  }) => void; // Callback para adicionar a transação
}

export default function DialogDash({
  fixedExpenses,
  adverseExpenses,
  revenues,
  onAddTransaction,
}: DialogDashProps) {
  const [type, setType] = useState<"pagar" | "receber">("pagar");
  const [date, setDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [method, setMethod] = useState<string>("");
  const [installment, setInstallment] = useState<string>("1/1");
  const [paid, setPaid] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  const categories = type === "pagar" ? [...fixedExpenses, ...adverseExpenses] : revenues;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = parseFloat(value);
    if (!date || !description || !category || !method || !installment || isNaN(parsedValue)) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    onAddTransaction({
      date,
      description,
      category,
      method,
      installment,
      paid,
      value: type === "pagar" ? -Math.abs(parsedValue) : Math.abs(parsedValue), // Negativo para pagar, positivo para receber
      type,
    });

    // Resetar o formulário
    setDate("");
    setDescription("");
    setCategory("");
    setMethod("");
    setInstallment("1/1");
    setPaid(false);
    setValue("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30">
          <Plus size={14} /> Novo Pagamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Pagamento</DialogTitle>
          <DialogDescription>Preencha os detalhes da nova transação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "pagar" | "receber")}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              <option value="pagar">Contas a Pagar</option>
              <option value="receber">Contas a Receber</option>
            </select>
          </div>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border px-2 py-1 text-sm"
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
          <div>
            <Label htmlFor="method">Método de Pagamento</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded border px-2 py-1 text-sm"
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
          <div>
            <Label htmlFor="installment">Parcela</Label>
            <Input
              id="installment"
              value={installment}
              onChange={(e) => setInstallment(e.target.value)}
              placeholder="Ex: 1/1"
              required
            />
          </div>
          <div>
            <Label htmlFor="value">Valor (BRL)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="paid"
              type="checkbox"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
            />
            <Label htmlFor="paid">Pago</Label>
          </div>
          <Button type="submit">Adicionar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
