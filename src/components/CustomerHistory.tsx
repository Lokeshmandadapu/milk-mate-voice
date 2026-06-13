import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Milk, IndianRupee, CalendarDays } from "lucide-react";

interface SaleRecord {
  id: string;
  customerName: string;
  liters: number;
  amount: number;
  timestamp: Date;
}

interface CustomerHistoryProps {
  customerName: string;
  sales: SaleRecord[];
  onClose: () => void;
  isCustomer?: boolean;
}

const CustomerHistory: React.FC<CustomerHistoryProps> = ({ customerName, sales, onClose, isCustomer }) => {
  const customerSales = sales
    .filter((sale) => sale.customerName.toLowerCase() === customerName.toLowerCase())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const monthlySales = customerSales.filter((sale) => new Date(sale.timestamp) >= monthAgo);

  const chartData = Object.values(
    monthlySales.reduce<Record<string, { date: string; liters: number; amount: number }>>(
      (acc, sale) => {
        const dateKey = new Date(sale.timestamp).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        if (!acc[dateKey]) {
          acc[dateKey] = { date: dateKey, liters: 0, amount: 0 };
        }

        acc[dateKey].liters += sale.liters;
        acc[dateKey].amount += sale.amount;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalLiters = customerSales.reduce((sum, sale) => sum + sale.liters, 0);
  const totalAmount = customerSales.reduce((sum, sale) => sum + sale.amount, 0);

  if (customerSales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer history</CardTitle>
          <p className="text-sm text-muted-foreground">No milk records found for {customerName}.</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-2xl">{isCustomer ? 'My Milk Record' : customerName}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isCustomer ? 'Your milk consumption, cost, and monthly trend.' : 'Detailed milk history for the selected customer.'}
          </p>
        </div>
        {!isCustomer && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close history
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-background/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total milk delivered</p>
            <p className="mt-4 text-3xl font-semibold text-primary">{totalLiters.toFixed(2)}L</p>
          </div>
          <div className="rounded-3xl border border-border bg-background/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total billed amount</p>
            <p className="mt-4 text-3xl font-semibold text-amber-600">₹{totalAmount.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background/70 p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Entries in last 30 days</p>
            <p className="mt-4 text-3xl font-semibold text-foreground">{monthlySales.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-background/70 p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Milk volume trend</p>
              <p className="text-xs text-muted-foreground">Daily liters for the past 30 days</p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {chartData.length} days shown
            </div>
          </div>

          <ChartContainer
            id="customer-history"
            className="h-[340px] rounded-3xl border border-border bg-background/70 p-4"
            config={{ liters: { label: "Liters" } }}
          >
            <BarChart data={chartData} margin={{ top: 16, right: 18, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#7c7c7c" }} height={40} />
              <YAxis tick={{ fontSize: 12, fill: "#7c7c7c" }} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="liters" fill="#2563eb" radius={[8, 8, 0, 0]} name="Liters" />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border bg-background/70 shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="bg-muted px-4 text-sm uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Liters</th>
                <th className="px-6 py-4">Cost</th>
              </tr>
            </thead>
            <tbody>
              {customerSales.map((sale) => {
                const date = new Date(sale.timestamp);
                return (
                  <tr key={sale.id} className="border-t border-border/60 even:bg-white/5">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </td>
                    <td className="px-6 py-4 text-sm">{sale.liters.toFixed(2)}L</td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">₹{sale.amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerHistory;
