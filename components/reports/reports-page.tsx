"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarRange, FileSpreadsheet, Printer } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartFrame } from "@/components/data/chart-frame";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateFinancialTwin, compareScenario } from "@/lib/financial/engine";
import { sampleScenario } from "@/lib/financial/sample-data";
import { chartTheme, chartTooltipStyle } from "@/lib/presentation/chart-theme";
import { motionTokens, revealVariants } from "@/lib/motion/variants";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { twinToCsv } from "@/lib/reports/export";
import { formatCurrency } from "@/lib/utils";

type ReportPeriod = "monthly" | "quarterly" | "annual";

const reportOptions: Array<{
  id: ReportPeriod;
  title: string;
  description: string;
  months: number;
}> = [
  { id: "monthly", title: "Monthly outlook", description: "The next modeled month", months: 1 },
  { id: "quarterly", title: "Quarterly outlook", description: "The next three modeled months", months: 3 },
  { id: "annual", title: "Annual outlook", description: "The full 12-month model", months: 12 }
];

export function ReportsPage() {
  const { profile } = useFinancialProfile();
  const shouldReduceMotion = useReducedMotion() === true;
  const [selectedReport, setSelectedReport] = useState<ReportPeriod>("annual");
  const [exportStatus, setExportStatus] = useState("");
  const twin = calculateFinancialTwin(profile);
  const selectedOption = reportOptions.find((option) => option.id === selectedReport) ?? reportOptions[2];
  const visibleTimeline = twin.timeline.slice(0, selectedOption.months).map((point) => ({
    ...point,
    netWorth: Math.round(point.netWorth),
    savings: Math.round(point.savings)
  }));
  const endingPoint = visibleTimeline[visibleTimeline.length - 1];
  const averageCashFlow = visibleTimeline.reduce((sum, point) => sum + point.cashFlow, 0) / visibleTimeline.length;
  const chartSummary = `${selectedOption.title}: net worth changes from ${formatCurrency(twin.netWorth, profile.currency)} to ${formatCurrency(endingPoint.netWorth, profile.currency)}, with ending savings of ${formatCurrency(endingPoint.savings, profile.currency)}.`;

  const exportCsv = () => {
    let url = "";

    try {
      const csv = twinToCsv(twin, compareScenario(profile, sampleScenario));
      url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "financial-twin-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setExportStatus("CSV downloaded. It contains the active profile's full 12-month model and decision comparison.");
    } catch {
      setExportStatus("CSV export could not be created. Please try again.");
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  };

  const printReport = () => {
    setExportStatus(`${selectedOption.title} is ready in the print dialog. Choose Save as PDF to create a PDF.`);
    window.print();
  };

  return (
    <div className="report-print-root mx-auto min-w-0 max-w-[1280px]">
      <AppPageHeader
        eyebrow="Active financial model"
        title="Report workspace"
        description="Select a reporting horizon, inspect the matching model evidence, then print that view or export the complete model as CSV."
        action={
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="outline" onClick={printReport}>
              <Printer className="size-4" aria-hidden="true" />
              Print / save PDF
            </Button>
            <Button onClick={exportCsv}>
              <FileSpreadsheet className="size-4" aria-hidden="true" />
              Export full CSV
            </Button>
          </div>
        }
      />

      <p role="status" aria-live="polite" className="no-print mb-5 min-h-5 text-sm font-semibold text-primary">
        {exportStatus}
      </p>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={selectedReport}
            className="report-motion-surface min-w-0"
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0 } }}
            variants={revealVariants}
            transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
          >
            <ChartFrame
              title={`${selectedOption.title} — net worth and savings`}
              description={`Engine-projected balances across ${selectedOption.months} ${selectedOption.months === 1 ? "month" : "months"}.`}
              summary={chartSummary}
              className="min-w-0"
            >
              <div className="h-80 min-w-0" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visibleTimeline} margin={{ left: 4, right: 8, top: 8 }}>
                    <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="month" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke={chartTheme.axis}
                      tickLine={false}
                      axisLine={false}
                      width={64}
                      tickFormatter={(value) => new Intl.NumberFormat("en", { notation: "compact" }).format(value)}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      name="Net worth"
                      stroke={chartTheme.current}
                      fill={chartTheme.current}
                      fillOpacity={0.14}
                      strokeWidth={3}
                      isAnimationActive={!shouldReduceMotion}
                      animationDuration={motionTokens.deliberate * 1000}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      name="Savings"
                      stroke={chartTheme.after}
                      fill={chartTheme.after}
                      fillOpacity={0.08}
                      strokeWidth={2}
                      isAnimationActive={!shouldReduceMotion}
                      animationDuration={motionTokens.deliberate * 1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartFrame>
          </motion.div>
        </AnimatePresence>

        <Card className="no-print min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
              <CalendarRange className="size-5 text-primary" aria-hidden="true" />
              Reporting horizon
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">Selection updates the chart, summary metrics, and evidence table.</p>
          </CardHeader>
          <CardContent>
            <fieldset className="grid gap-3">
              <legend className="sr-only">Choose report period</legend>
              {reportOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/10"
                >
                  <input
                    type="radio"
                    name="report-period"
                    value={option.id}
                    checked={selectedReport === option.id}
                    onChange={() => setSelectedReport(option.id)}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span>
                    <span className="block font-bold">{option.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              CSV export intentionally includes all 12 months so the existing export schema stays complete and consistent.
            </p>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="report-summary-title" className="mt-6 min-w-0">
        <h2 id="report-summary-title" className="sr-only">Selected report summary</h2>
        <Stagger className="report-motion-surface grid min-w-0 gap-4 md:grid-cols-3">
          <StaggerItem className="report-motion-surface h-full min-w-0">
            <Card className="h-full min-w-0">
              <CardContent className="pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Starting net worth</p>
                <p className="mt-2 text-2xl font-black">{formatCurrency(twin.netWorth, profile.currency)}</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem className="report-motion-surface h-full min-w-0">
            <Card className="h-full min-w-0">
              <CardContent className="pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Ending net worth</p>
                <p className="mt-2 text-2xl font-black">{formatCurrency(endingPoint.netWorth, profile.currency)}</p>
                <p className="mt-1 text-sm text-muted-foreground">at month {endingPoint.month}</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem className="report-motion-surface h-full min-w-0">
            <Card className="h-full min-w-0">
              <CardContent className="pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Average monthly cash flow</p>
                <p className="mt-2 text-2xl font-black">{formatCurrency(averageCashFlow, profile.currency)}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </Stagger>
      </section>

      <Card className="mt-6 min-w-0">
        <CardHeader>
          <CardTitle>{selectedOption.title} evidence</CardTitle>
          <p className="text-sm text-muted-foreground">Monthly engine outputs for the selected reporting horizon.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <caption className="sr-only">{chartSummary}</caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Period</TableHead>
                <TableHead scope="col">Income</TableHead>
                <TableHead scope="col">Expenses</TableHead>
                <TableHead scope="col">Cash flow</TableHead>
                <TableHead scope="col">Savings</TableHead>
                <TableHead scope="col">Net worth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody animated>
              {visibleTimeline.map((point) => (
                <TableRow key={point.month}>
                  <th scope="row" className="p-3 text-left font-semibold">{point.month}</th>
                  <TableCell>{formatCurrency(point.income, profile.currency)}</TableCell>
                  <TableCell>{formatCurrency(point.expenses, profile.currency)}</TableCell>
                  <TableCell>{formatCurrency(point.cashFlow, profile.currency)}</TableCell>
                  <TableCell>{formatCurrency(point.savings, profile.currency)}</TableCell>
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
