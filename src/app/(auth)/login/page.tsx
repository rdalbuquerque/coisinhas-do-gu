import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby } from "lucide-react";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/5 via-background to-secondary/10">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-soft">
          <Baby className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Coisinhas do Gu</h1>
          <p className="text-sm text-muted-foreground mt-1">
            O enxoval do Gustavo
          </p>
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Entrar</CardTitle>
          <p className="text-sm text-muted-foreground">Digite a senha para continuar</p>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
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
