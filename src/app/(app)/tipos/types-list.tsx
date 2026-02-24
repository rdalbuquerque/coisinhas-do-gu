"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  createClothingType,
  updateClothingType,
  deleteClothingType,
} from "@/app/actions/clothing-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ClothingType } from "@/lib/types/database";

interface TypeWithCount extends ClothingType {
  usage_count: number;
}

export function TypesList({ types }: { types: TypeWithCount[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<TypeWithCount | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TypeWithCount | null>(null);

  function openCreate() {
    setEditingType(null);
    setName("");
    setDialogOpen(true);
  }

  function openEdit(type: TypeWithCount) {
    setEditingType(type);
    setName(type.name);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (editingType) {
        await updateClothingType(editingType.id, name.trim());
        toast.success("Tipo atualizado!");
      } else {
        await createClothingType(name.trim());
        toast.success("Tipo criado!");
      }
      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteClothingType(deleteTarget.id);
      toast.success("Tipo removido!");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover.");
    }
    setLoading(false);
  }

  return (
    <>
      <Button onClick={openCreate} size="sm">
        <Plus className="mr-1 h-4 w-4" />
        Novo tipo
      </Button>

      <div className="space-y-2">
        {types.map((type) => (
          <Card key={type.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{type.name}</span>
                {type.usage_count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {type.usage_count} peça{type.usage_count !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(type)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(type)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Editar tipo" : "Novo tipo de roupa"}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome do tipo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <DialogFooter>
            <Button onClick={handleSave} disabled={loading || !name.trim()}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remover tipo"
        description={
          deleteTarget?.usage_count
            ? `"${deleteTarget.name}" está em uso em ${deleteTarget.usage_count} peça(s). Remova as peças primeiro.`
            : `Tem certeza que deseja remover "${deleteTarget?.name}"?`
        }
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
