import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useProductFilters } from "./useProductFilters";
import { useDebounce } from "../../hooks/useDebounce";
import { useCategories, useDeleteProduct, useProducts } from "./product.queries";
import type { Product } from "../../lib/types";
import { getErrorMessage } from "../../lib/api";
import { Alert, Box, Button, MenuItem, Snackbar, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ProductsTable } from "./ProductsTable";
import { ProductFormDialog } from './ProductFormDialog';
import { ConfirmDialog } from "../../components/ConfirmDialog";
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

export function ProductsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const canDelete = user?.role === 'ADMIN';


  // 1. Filtros (viven en la URL)
  const { query, setFilters } = useProductFilters();
  const [searchText, setSearchText] = useState(query.search ?? '');
  const debouncedSearch = useDebounce(searchText);

  useEffect(() => {
    if((query.search ?? '') !== debouncedSearch) setFilters({search: debouncedSearch})
  })

  // 2. Datos del servidor

  const { data, isPending, isError, error, isFetching } = useProducts(query);
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteProduct();

  // 3. Estadp de la UI (que diálogo está abierto)
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => setToast({ message: `"${toDelete.name}" eliminado correctamente`, severity:'success' }),
      onError: (err) => setToast({ message: getErrorMessage(err), severity: 'error' }),
      onSettled: () => setToDelete(null),
    })
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  // CLEAN FILTERS FUNCTION

  const hasFilters = query.search || query.active !== undefined || query.categoryId !== undefined;

  function clearFilters() {
    setFilters({
      active: undefined,
      categoryId: undefined,
      search: undefined
    })

    setSearchText('')
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Productos</Typography>
        <Box  >
          <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: 'center' }}>
          {canEdit && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} >
              Nueva
            </Button>
          )}
          {hasFilters && (
            <Button startIcon={<FilterAltOffIcon />} onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}

          </Stack>

        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Buscar por nombre o SKU"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{flex: 1}}
        />
        <TextField
          select
          label="Categoría"
          size="small"
          value={query.categoryId ?? ''}
          onChange={(e) => setFilters({ categoryId: Number(e.target.value) || undefined })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
        </TextField>
        <TextField
          select
          label="Estado"
          size="small"
          value={query.active === undefined ? '' : String(query.active)}
          onChange={(e) => setFilters({ active: e.target.value === 'true' ? true : e.target.value === 'false'? false  : undefined })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="false">Inactivo</MenuItem>
          <MenuItem value="true">Activo</MenuItem>

        </TextField>
      </Stack>

      {isError ? (
        <Alert severity="error"> {getErrorMessage(error)} </Alert>
      ) : (
            <ProductsTable
              result={data}
              isLoading={isPending}
              query={query}
              isFetching={isFetching}
              canEdit={canEdit}
              canDelete={canDelete}
              onChange={setFilters}
              onEdit={openEdit}
              onDelete={setToDelete}
            />
      )}

      <ProductFormDialog
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(message) => {
          setFormOpen(false);
          setToast({message, severity:'success'})
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${toDelete?.name}"? Esta acción no se puede deshacer.`}
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />

        <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)}>
          {toast ? (
            <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
              {toast.message}
            </Alert>
          ) : undefined}
        </Snackbar>
    </Box>
  )

}
