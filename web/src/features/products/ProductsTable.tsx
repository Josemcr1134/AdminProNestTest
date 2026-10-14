import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import type { Paginated, Product } from '../../lib/types';
import type { ProductQuery, SortBy } from './products.api';

const LOW_STOCK_THRESHOLD = 5;

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });

const columns: { key: SortBy | 'sku' | 'category'; label: string; sortable: boolean; align?: 'right' }[] = [
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'sku', label: 'SKU', sortable: false },
  { key: 'category', label: 'Categoría', sortable: false },
  { key: 'price', label: 'Precio', sortable: true, align: 'right' },
  { key: 'stock', label: 'Stock', sortable: true, align: 'right' },
];

interface ProductsTableProps {
  result?: Paginated<Product>;
  query: ProductQuery;
  isLoading: boolean;
  isFetching: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onChange: (changes: Partial<ProductQuery>) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

// Componente "tonto": solo recibe datos por props y avisa con callbacks. No sabe de la API ni de la URL.
export function ProductsTable({ result, query, isLoading, isFetching, canEdit, canDelete, onChange, onEdit, onDelete }: ProductsTableProps) {
  const rows = result?.data ?? [];
  const hasActions = canEdit || canDelete;
  const colCount = columns.length + 1 + (hasActions ? 1 : 0);

  function handleSort(key: SortBy) {
    const isSame = query.sortBy === key;
    onChange({ sortBy: key, sortOrder: isSame && query.sortOrder === 'asc' ? 'desc' : 'asc' });
  }

  return (
    <Paper>
      {/* Barra de carga arriba mientras se trae otra página (los datos viejos siguen visibles) */}
      <LinearProgress sx={{ visibility: isFetching ? 'visible' : 'hidden' }} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={query.sortBy === col.key}
                      direction={query.sortBy === col.key ? query.sortOrder : 'asc'}
                      onClick={() => handleSort(col.key as SortBy)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              <TableCell>Estado</TableCell>
              {hasActions && <TableCell align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Primera carga: filas fantasma con la misma forma que las reales para que la tabla no salte */}
            {isLoading &&
              Array.from({ length: query.limit }, (_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align}>
                      <Skeleton
                        animation="wave"
                        width={col.align === 'right' ? 70 : '80%'}
                        sx={{ ml: col.align === 'right' ? 'auto' : undefined }}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton animation="wave" variant="rounded" width={60} height={24} sx={{ borderRadius: 4 }} />
                  </TableCell>
                  {hasActions && (
                    <TableCell align="right">
                      <Skeleton animation="wave" variant="circular" width={28} height={28} sx={{ display: 'inline-block' }} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {rows.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell align="right">{money.format(Number(product.price))}</TableCell>
                <TableCell align="right" sx={{ color: product.stock < LOW_STOCK_THRESHOLD ? 'error.main' : undefined }}>
                  {/* inline-flex alinea el número y el icono en la misma línea, pegados a la derecha */}
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    {product.stock < LOW_STOCK_THRESHOLD && (
                      <Tooltip title="Stock bajo">
                        <WarningAmberIcon fontSize="small" aria-label="Stock bajo" />
                      </Tooltip>
                    )}
                    {product.stock}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={product.active ? 'Activo' : 'Inactivo'}
                    color={product.active ? 'success' : 'default'}
                  />
                </TableCell>
                {hasActions && (
                  <TableCell align="right">
                    {canEdit && (
                      <IconButton size="small" aria-label={`Editar ${product.name}`} onClick={() => onEdit(product)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" aria-label={`Eliminar ${product.name}`} onClick={() => onDelete(product)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {result && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={colCount} align="center" sx={{ py: 4 }}>
                  No hay productos con esos filtros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={result?.meta.total ?? 0}
        page={query.page - 1} // MUI cuenta desde 0, la API desde 1
        rowsPerPage={query.limit}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(_, page) => onChange({ page: page + 1 })}
        onRowsPerPageChange={(e) => onChange({ limit: Number(e.target.value) })}
        labelRowsPerPage="Por página"
      />
    </Paper>
  );
}
