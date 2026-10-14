import z from "zod";
import type { Product } from "../../lib/types";
import { useCategories, useCreateProduct, useUpdateProduct } from "./product.queries";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, Switch, TextField } from "@mui/material";
import { getErrorMessage } from "../../lib/api";

const productSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100),
  sku: z.string().trim().min(3, 'Mínimo 3 caracteres').max(30),
  price: z.number({ error: 'Ingresa un precio' }).positive('Debe ser mayor a 0'),
  stock: z.number({ error: 'Ingresa el stock' }).int('Sin decimales').min(0, 'No pueda ser negativo'),
  active: z.boolean(),
  categoryId: z.number({ error: 'Elige una categoría' })
});


type ProductForm = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: (message:string) => void
}


export function ProductFormDialog({ open, product, onClose, onSaved }: ProductFormDialogProps) {
  const isEdit = product !== null;
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });


  useEffect(() => {
    if (!open) return;
    createMutation.reset();
    updateMutation.reset();
    reset(
      product
        ? {
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          stock: product.stock,
          active: product.active,
          categoryId: product.categoryId
        } : { name: '', sku: '', stock: 0, active: true }
    );
  }, [open, product, reset]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onSubmit( data : ProductForm) {
    if (isEdit) {
      updateMutation.mutate(
        { id: product.id, data },
        { onSuccess: () => onSaved(`"${data.name}" actualizado`)}
      )
    } else {
      createMutation.mutate(data, { onSuccess: () => onSaved(`"${data.name}" creado`) });
    }
  }


  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {mutation.isError && <Alert severity="error">{getErrorMessage(mutation.error)}</Alert>}
          <TextField label="Nombre" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="SKU" {...register('sku')} error={!!errors.sku} helperText={errors.sku?.message} />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Precio"
              type="number"
              fullWidth
              slotProps={{ htmlInput: { step: '0.01' } }}
              {...register('price', { valueAsNumber: true })}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
            <TextField
              label="Stock"
              type="number"
              fullWidth
              {...register('stock', { valueAsNumber: true })}
              error={!!errors.stock}
              helperText={errors.stock?.message}
            />
          </Stack>
          {/* Los componentes de MUI que no son un <input> nativo se conectan con Controller */}
          <Controller
            name="categoryId"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Categoría"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label="Activo"
                control={<Switch checked={field.value ?? true} onChange={(_, checked) => field.onChange(checked)} />}
              />
            )}
          />
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
