import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

const client = jwksClient({
  jwksUri: 'https://YOUR_DOMAIN/.well-known/jwks.json' // ← cambia con il tuo dominio Auth0
});

function getKey(header: jwt.JwtHeader, callback: (err: Error | null, key?: string) => void) {
  client.getSigningKey(header.kid as string, (err: Error | null, key: any) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

export const verifyToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: 'YOUR_API_IDENTIFIER', // ← cambia con il tuo identifier API
        issuer: 'https://YOUR_DOMAIN/', // ← cambia con il tuo dominio Auth0
        algorithms: ['RS256']
      },
      (err: jwt.VerifyErrors | null, decoded?: object | string) => {
        if (err) reject(err);
        else resolve(decoded as JwtPayload);
      }
    );
  });
};

// 🔹 Middleware Express riutilizzabile
export const verifyTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token mancante');

  try {
    const decoded: any = await verifyToken(token);
    (req as any).user = decoded; // aggiungiamo info utente nella request
    next();
  } catch {
    res.status(401).send('Token non valido');
  }
};
