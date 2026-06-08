import 'dotenv/config';
import express from 'express'
import cors from 'cors';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRouter from './routers/authRouter.js';
import postsRouter from './routers/postsRouter.js';
import usersRouter from './routers/usersRouter.js';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const server = createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

app.use(express.json());

app.use(express.urlencoded());

app.use(helmet());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

//Ratelimiters
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 500, // Limit each IP to 50 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
    skip:(req) => req.path.startsWith('/socket.io')
});

app.use(generalLimiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    skip:(req) => req.path.startsWith('/socket.io')
});

const socketLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 2000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

app.use('/socket.io', socketLimiter);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}));

//Endpoints

app.use("/auth", authLimiter, authRouter);
app.use("/api/posts", postsRouter(io));
app.use("/api/users", usersRouter);


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

server.listen(PORT, () => console.log("Server is running on port", PORT));