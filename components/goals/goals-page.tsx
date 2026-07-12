"use client";

import { CalendarDays, Flag, Target } from "lucide-react";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { forecastGoalCompletion } from "@/lib/financial/engine";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { formatCurrency } from "@/lib/utils";

export function GoalsPage() {
  const { profile } = useFinancialProfile();
  const goals = forecastGoalCompletion(profile);

  return (
    <div className="mx-auto max-w-[1280px]">
      <AppPageHeader
        title="Goals"
        description="Track emergency fund, retirement, house, wedding, vacation, and education goals with forecast completion dates."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.id} className={goal.priority === "High" ? "border-emerald-400/30 bg-emerald-400/10" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-blue-200">
                  <Target />
                </span>
                <Badge variant={goal.priority === "High" ? "success" : goal.priority === "Medium" ? "blue" : "secondary"}>
                  {goal.priority}
                </Badge>
              </div>
              <CardTitle className="normal-case tracking-normal">{goal.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{formatCurrency(goal.currentAmount, profile.currency)}</span>
                  <span className="font-bold">{formatCurrency(goal.targetAmount, profile.currency)}</span>
                </div>
                <Progress value={goal.progress} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-muted-foreground">Monthly</p>
                  <p className="font-black">{formatCurrency(goal.monthlyContribution, profile.currency)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-muted-foreground">Forecast</p>
                  <p className="font-black">{goal.forecastDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {["Wedding", "Education"].map((name) => (
          <Card key={name} className="border-dashed">
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Flag className="text-blue-300" />
              <p className="font-bold text-foreground">{name}</p>
              <p className="max-w-xs text-sm">Create this goal from onboarding or a future simulation.</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="text-blue-300" />
            Financial Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {["Loan payment due", "Salary deposit", "Quarterly report", "Insurance renewal"].map((item, index) => (
            <div key={item} className="rounded-xl bg-white/[0.04] p-4">
              <p className="text-xs text-muted-foreground">July {8 + index * 5}, 2026</p>
              <p className="mt-1 font-bold">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
