import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-lg font-medium uppercase tracking-[0.25em] text-foreground">
          Coisinhas do Gu
        </h1>
        <div className="mx-auto mt-3 h-px w-12 bg-primary/40" />
        <p className="text-sm text-muted-foreground mt-3">
          O enxoval do Gustavo
        </p>
      </div>

      <Card className="w-full max-w-xs">
        <CardContent>
          <form action={login} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-xs uppercase tracking-wider">
                Senha
              </Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
            {error && (
              <p className="text-sm text-center text-destructive">
                Senha incorreta.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
