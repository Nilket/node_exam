import 'dotenv/config';
import express from 'express'
import cors from 'cors';
import session from 'express-session';
import authRouter from './routers/authRouter.js';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

app.use(express.json());

app.use(express.urlencoded());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 50, // Limit each IP to 50 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
});

app.use(generalLimiter);


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}));

app.use("/auth", authLimiter, authRouter);
app.use(helmet());

app.get('/{*splat}', (req, res) => {
    res.send(`<div>
                <h1>404</h1>
                <h3>Page - ${req.path} - doesn't exist</h3>
            </div>`
    );
});

app.all('/{*splat}', (req, res)  => {
    res.send({ errorMessage: `The route for ${req.path} and the HTTP method ${req.method} does not exist` });
});

const PORT = process.env.PORT ?? 8080;

app.listen(PORT, () => {
    console.log("Server is running port", PORT);
});