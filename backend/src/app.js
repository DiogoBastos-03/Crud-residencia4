import express from 'express';
import cors from 'cors';
import usuariosRoutes from './routes/usuarios.routes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/usuarios', usuariosRoutes);

app.use(errorHandler);

export default app;
