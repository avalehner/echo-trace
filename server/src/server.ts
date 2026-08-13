import 'dotenv/config';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import memoriesRouter from './routes/memories.ts';
import searchRouter from './routes/search.ts';

const app: Express = express();

//middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

//routes
app.use('/api/memories', memoriesRouter);
app.use('/api/search', searchRouter);

//server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
