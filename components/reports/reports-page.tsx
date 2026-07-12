"use client";

import { FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateFinancialTwin, compareScenario } from "@/lib/financial/engine";
import { sampleScenario } from "@/lib/financial/sample-data";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { twinToCsv } from "@/lib/reports/export";
import { formatCurrency } from "@/lib/utils";

export function ReportsPage() {
  const { profile } = useFinancialProfile();
  const twin = calculateFinancialTwin(profile);
  const yearly = twin.timeline.map((point) => ({
    month: point.month,
    netWorth: Math.round(point.netWorth),
    savings: Math.round(point.savings)
  }));

  const exportCsv = () => {
    const csv = twinToCsv(twin, compareScenario(profile, sampleScenario));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "financial-twin-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export downloaded from the active profile.");
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <AppPageHeader
        title="Reports"
        description="Monthly, quarterly, and annual reports with export flows for PDF and CSV."
        action={
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => window.print()}>
              <Printer data-icon="inline-start" />
              Print / save PDF
            </Button>
            <Button onClick={exportCsv}>
              <FileSpreadsheet data-icon="inline-start" />
              Export CSV
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Annual Net Worth Forecast</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearly}>
                <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0d1423", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }} />
                <Area dataKey="netWorth" stroke="#10b981" fill="#10b98122" />
                <Area dataKey="savings" stroke="#3b82f6" fill="#3b82f620" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Report Library</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {["Monthly - June 2026", "Quarterly - Q2 2026", "Annual - 2026 Forecast"].map((item) => (
              <button key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left hover:bg-white/[0.07]">
                <Printer className="text-blue-300" />
                <span className="font-semibold">{item}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Expenses</TableHead>
                <TableHead>Surplus</TableHead>
                <TableHead>Net Worth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {twin.timeline.slice(0, 6).map((point) => (
                <TableRow key={point.month}>
                  <TableCell className="font-semibold">{point.month}</TableCell>
                  <TableCell>{formatCurrency(point.income, profile.currency)}</TableCell>
                  <TableCell>{formatCurrency(point.expenses, profile.currency)}</TableCell>
                  <TableCell>{formatCurrency(point.cashFlow, profile.currency)}</TableCell>
                  <TableCell>{formatCurrency(point.netWorth, profile.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
