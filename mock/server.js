import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.post('/auth-token/', (req, res) => {
  const { username = 'user' } = req.body || {};
  res.json({ token: 'dummy-token', username });
});

app.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});

