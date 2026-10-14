import {  useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { Category } from "../../lib/types";
import { getErrorMessage } from "../../lib/api";
import { Alert, Box, Button,  Snackbar, Stack,  Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { CategoriesTable } from './CategoriesTable';
import { CategoryFormDialog } from "./CategoryFormDialog";
import { useCategories, useDeleteCategory } from "./categories.queries";

export function CategoriesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const canDelete = user?.role === 'ADMIN';

  const { data, isPending, isError, error, isFetching } = useCategories();
  const deleteMutation = useDeleteCategory();

  // 3. Estadp de la UI (que diálogo está abierto)
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
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

  function openEdit(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }



  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Categorías</Typography>
        <Box  >
          <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: 'center' }}>
          {canEdit && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} >
              Nueva
            </Button>
          )}
          </Stack>

        </Box>
      </Stack>

      {isError ? (
        <Alert severity="error"> {getErrorMessage(error)} </Alert>
      ) : (
            <CategoriesTable
              result={data}
              isLoading={isPending}
              isFetching={isFetching}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={openEdit}
              onDelete={setToDelete}
            />
      )}

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(message) => {
          setFormOpen(false);
          setToast({message, severity:'success'})
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar categoría"
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
