import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import productsRouter from './products';
import categoriesRouter from './categories';
import cartRouter from './cart';
import ordersRouter from './orders';
import addressesRouter from './addresses';
import paymentsRouter from './payments';
import favoritesRouter from './favorites';
import notificationsRouter from './notifications';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);
router.use('/addresses', addressesRouter);
router.use('/payments', paymentsRouter);
router.use('/favorites', favoritesRouter);
router.use('/notifications', notificationsRouter);

export default router;

