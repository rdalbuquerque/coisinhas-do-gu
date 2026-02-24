"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteEnxoval } from "@/app/actions/enxovais";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteEnxovalButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteEnxoval(id);
      toast.success("Enxoval removido!");
      router.push("/enxoval");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover.");
    }
    setLoading(false);
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Trash2 className="h-5 w-5 text-destructive" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Remover enxoval"
        description="Tem certeza que deseja remover este enxoval e todos os seus itens?"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
