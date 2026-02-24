"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    // Check if email is allowed
    const { data: allowed } = await supabase
      .from("allowed_emails")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!allowed) {
      setError("Email não autorizado.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError("Erro ao enviar o link. Tente novamente.");
    } else {
      setMessage("Verifique seu email! Enviamos um link de acesso.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Baby className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Coisinhas do Gu</CardTitle>
          <p className="text-sm text-muted-foreground">
            Entre com seu email para acessar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de acesso"}
            </Button>
            {message && (
              <p className="text-sm text-center text-green-600">{message}</p>
            )}
            {error && (
              <p className="text-sm text-center text-destructive">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
