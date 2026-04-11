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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Baby className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Coisinhas do Gu</CardTitle>
          <p className="text-sm text-muted-foreground">Entre com a senha</p>
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
            <Button type="submit" className="w-full">
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
