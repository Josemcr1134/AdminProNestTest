import z from "zod";
import type { Category } from "../../lib/types";
import { useCreateCategory, useUpdateCategory } from "./categories.queries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres')
})

type CategoryForm = z.infer<typeof categorySchema>;


interface CategoryFormDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: (message:string) => void
}

export function CategoryFormDialog({ open, category, onClose, onSaved }: CategoryFormDialogProps) {
  const isEdit = category !== null;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) });

  useEffect(() => {
    if (!open) return;
    createMutation.reset();
    updateMutation.reset();
    reset(
      category
        ? {
          name: category.name
        } : { name: '' }
    );
  }, [open, category, reset]);

  function onSubmit(data: CategoryForm) {
    if (isEdit) {
      updateMutation.mutate(
        { id: category.id, data },
        { onSuccess: () => onSaved(`"${data.name}" actualizado`)}
      )
    } else {
      createMutation.mutate(data, {onSuccess: () => onSaved(`"${data.name}" creado`)})
    }
  }

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Editar categoría' : 'Crear categoría'} </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField label="Nombre" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />

          </Stack>
        </DialogContent>
        <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" loading={mutation.isPending}>
          Guardar
        </Button>
      </DialogActions>
      </form>
    </Dialog>
  )
}
