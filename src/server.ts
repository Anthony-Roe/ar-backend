import app from './app';
import cookieParser from 'cookie-parser';

app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
