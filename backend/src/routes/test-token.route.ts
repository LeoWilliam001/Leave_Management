// routes/test-token.routes.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// HR role = 2, regular user = 1
router.get('/generate-token', (req, res) => {
  const token = jwt.sign(
    { id: 5, role: 2 }, // example HR user
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

export default router;
