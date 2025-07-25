import express, { Router, Request, Response, NextFunction } from 'express';

const router: Router = express.Router();

router.get('/', async function (req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ success: true, message: 'Server is working.' });
});

export default router;
