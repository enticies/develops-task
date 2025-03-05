import { Router } from 'express';
import path from 'path';

const router = Router();

router.get('/ui', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export default router;
