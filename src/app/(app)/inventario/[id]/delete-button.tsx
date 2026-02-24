"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteClothing } from "@/app/actions/clothes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteClothingButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteClothing(id);
      toast.success("Peça removida!");
      router.push("/inventario");
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
        title="Remover peça"
        description="Tem certeza que deseja remover esta peça? Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
