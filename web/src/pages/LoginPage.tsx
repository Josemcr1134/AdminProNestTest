import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Card, CardContent, TextField, Typography, Link as MuiLink } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';
import { useAuth } from '../auth/AuthContext';
import { api, getErrorMessage } from '../lib/api';
import type { AuthResponse } from '../lib/types';
import { Link as RouterLink } from 'react-router';

const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { user, setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => (await api.post<AuthResponse>('/auth/login', data)).data,
    onSuccess: (data) => {
      setSession(data);
      navigate(from, { replace: true });
    }
  });

  if (user) return <Navigate to={from} replace />

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: 'grey.100', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            AdminPro
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {loginMutation.isError && <Alert severity='error'>{getErrorMessage(loginMutation.error)}</Alert>}
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            >
            </TextField>
            <TextField
              label="Contraseña"
              type="password"
              autoComplete='current-password'
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            ></TextField>
            <Button type="submit" variant="contained" size="large" loading={loginMutation.isPending}>
              Entrar
            </Button>
            <Typography variant="body2" align="center">
              ¿No tienes cuenta?{' '}
              <MuiLink component={RouterLink} to="/register">
                Regístrate
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
