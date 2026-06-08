import { z } from 'zod';

export const LoginRequestSchema = z.object({
  username: z.string().min(3, 'El usuario es muy corto'),
  password: z.string().min(6, 'La contraseña es muy corta'),
});

export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>;

export interface LoginResponseDTO {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
  };
}
