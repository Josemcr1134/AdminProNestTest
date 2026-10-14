import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Category } from '../../lib/types';
import {
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';




const columns:{label:string, key:string} [] = [
  { key: 'name', label: 'Nombre'},
  { key: 'products', label: '# Productos' },

];

interface CategoryTableProps {
  result?: Category[];
  isLoading: boolean;
  isFetching: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

// Componente "tonto": solo recibe datos por props y avisa con callbacks. No sabe de la API ni de la URL.
export function CategoriesTable({ result, isLoading, isFetching, canEdit, canDelete,  onEdit, onDelete }: CategoryTableProps) {
  const rows = result ?? [];
  const hasActions = canEdit || canDelete;

  return (
    <Paper>
      {/* Barra de carga arriba mientras se trae otra página (los datos viejos siguen visibles) */}
      <LinearProgress sx={{ visibility: isFetching ? 'visible' : 'hidden' }} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} >
                 {  col.label}
                </TableCell>
              ))}
              {hasActions && <TableCell align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Primera carga: filas fantasma con la misma forma que las reales para que la tabla no salte */}
            {isLoading &&
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key} >
                      <Skeleton
                        animation="wave"
                        width={ '80%'}

                      />
                    </TableCell>
                  ))}


                  {hasActions && (
                    <TableCell align="right">
                      <Skeleton animation="wave" variant="circular" width={28} height={28} sx={{ display: 'inline-block' }} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {rows.map((category) => (
              <TableRow key={category.id} hover>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category._count?.products ?? 0}</TableCell>
                {hasActions && (
                  <TableCell align="right">
                    {canEdit && (
                      <IconButton size="small" aria-label={`Editar ${category.name}`} onClick={() => onEdit(category)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" aria-label={`Eliminar ${category.name}`} onClick={() => onDelete(category)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </TableContainer>

    </Paper>
  );
}
