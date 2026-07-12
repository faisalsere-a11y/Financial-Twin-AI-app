"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="mx-auto mt-10 max-w-xl">
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">Something interrupted the financial twin.</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">This screen could not load. Try rendering the page again.</p>
        <Button onClick={reset}>Retry</Button>
      </CardContent>
    </Card>
  );
}
