import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useLocation, useNavigate } from "react-router";
import z from "zod";
import type { AuthResponse } from "../lib/types";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api, getErrorMessage } from "../lib/api";
import {  Box,  Card,  CardContent,  Typography, Alert,  TextField,  Button, Link as MuiLink } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { Link as RouterLink } from 'react-router';



const registerSchema = z.object({
  email: z.email('Email inválido'),
  name: z.string().min(2, 'Debes ingresar un nombre de mínimo 2 caractéres').max(60,'Debes ingresar un nombre de máximo 60 caractéres'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string()
}).refine((d) => d.password === d.confirmPassword, { message: 'No coinciden', path: ['confirmPassword'] });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage ()  {
 const { user, setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

    const registerMutation = useMutation({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mutationFn: async ({confirmPassword, ...data}: RegisterForm) => (await api.post<AuthResponse>('/auth/register', data)).data,
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
              Registrate
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit((data) => registerMutation.mutate(data))}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              {registerMutation.isError && <Alert severity='error'>{getErrorMessage(registerMutation.error)}</Alert>}
              <TextField
                label="Nombre Completo"
                type="text"
                autoComplete="name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              >
              </TextField>
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
                autoComplete='new-password'
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              ></TextField>
              <TextField
                label="Confirma tu contraseña"
                type="password"
                autoComplete='new-password'
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              ></TextField>
              <Button type="submit" variant="contained" size="large" loading={registerMutation.isPending}>
                Crear cuenta
              </Button>
              <Typography variant="body2" align="center">
              ¿Ya tienes cuenta?{' '}
              <MuiLink component={RouterLink} to="/login">
                Inicia sesión
              </MuiLink>
            </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
}
