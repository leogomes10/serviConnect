import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './jwt'; // Importa a chave secreta validada (sem fallback inseguro)

// Estende a interface Request do Express para incluir os dados do usuário autenticado
export interface RequestAutenticado extends Request {
  usuario?: {
    id: number;
    email: string;
    nome: string;
  };
}

export const autenticarToken = (req: RequestAutenticado, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // O header vem no formato "Bearer TOKEN_AQUI", então pegamos a segunda parte
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, usuarioDecodificado) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }

    // Injeta os dados do usuário validado direto na requisição
    req.usuario = usuarioDecodificado as RequestAutenticado['usuario'];
    next(); // Autoriza a requisição a continuar para a rota!
  });
};