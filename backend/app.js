import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 300
})

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:5174',process.env.FRONTEND_DOMAIN],
    credentials: true
}))

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(limiter)


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
    console.log(`${new Date().toLocaleString()} - Server listening on port ${PORT}`);
});