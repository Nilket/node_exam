import e, { Router } from 'express';
import db from '../database/connection.js';
import { compareHashedPasswords, hashPassword } from '../utils/encryption.js';
import { isLoggedIn } from '../middleWare/authMiddleware.js';
import { sendWelcomeEmail } from '../utils/mailUtil.js';

const router = Router();

router.post("/login", async (req, res) =>{
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).send({message: "All fields are required"});
    }

    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);

    if(!user){
        return res.status(401).send({message: "Invalid credentials"});
    }

    const match = await compareHashedPasswords(password, user.password);

    if(!match){
        return res.status(401).send({message: "Invalid credentials"});
    }

    req.session.user = {id: user.id, username: username, email: user.email};
    res.json({user: { id: user.id, username: user.username, email: user.email}});
});

router.get("/me", isLoggedIn, (req, res) =>{
    if(!req.session.user){
        return res.status(401).send({user: null});
    }
    res.json({user: req.session.user});
});

router.post("/logout", (req, res) =>{
    req.session.destroy((e) =>{
        if (e) {
            return res.status(500).send({message: "Logout failed"});
        }
        res.clearCookie("connect.sid");
        res.json({message: "Logged out"});
    });
});

router.post("/register", async (req, res) =>{
    const { username, password, email, first_name, last_name } = req.body;

    if(!username || !password || !email || !first_name || !last_name){
        return res.status(400).send({message: "All fields are required"});
    }

    const existingUser = await db.get(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [username, email]
    );

    if(existingUser) {
        return res.status(409).send({message: "Username or email already taken"});
    }

    const hashed = await hashPassword(password);

    await db.run(
        `INSERT INTO users (username, password, email, first_name, last_name)
        VALUES (?,?,?,?,?)`,
        [username, hashed, email, first_name, last_name]
    );

    await sendWelcomeEmail(email, username);

    res.status(201).send({message: "Account created"});
});

export default router;