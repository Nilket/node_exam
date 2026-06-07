import { Router } from 'express';
import db from '../database/connection.js';
import { isLoggedIn } from '../middleWare/authMiddleware.js';

export default function postsRouter(io){
const router = Router();

router.get("/", isLoggedIn, async (req, res) =>{
    const { category } = req.query;

    try{
        const query = `
        SELECT p.*, u.username,
        COUNT(DISTINCT l.id) AS like_count,
        COUNT(DISTINCT c.id) AS comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN likes l ON l.post_id = p.id
        LEFT JOIN comments c ON c.post_id = p.id
        ${category ? 'WHERE p.category = ?' : ''}
        GROUP BY p.id
        ORDER BY p.created_at DESC
        `;

        const params = category ? [category] : [];
        const posts = await db.all(query, params);
        res.json({posts});
    } catch (e){
        return res.status(500).send({message: "Could not fetch posts"});
    }
});

router.post("/", isLoggedIn, async (req, res) =>{
    const { title, content, category } = req.body;
    const user_id = req.session.user.id;

    if(!title || !content){
        return res.status(400).send({message: "Title and content is required"});
    }

    try {
        const result = await db.run(
            `INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)`,
            [user_id, title, content, category || null]
        );
        return res.status(201).json({id: result.lastID});
    } catch (e) {
        return res.status(500).send({message: "Could not create post"});
    }
});

router.get("/:id", isLoggedIn, async (req, res) =>{
    const { id } = req.params;

    try{
        const post = await db.get(`
            SELECT p.*, u.username,
            COUNT(DISTINCT l.id) AS like_count,
            COUNT(DISTINCT c.id) AS comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON l.post_id = p.id
            LEFT JOIN comments c ON c.post_id = p.id
            WHERE p.id = ?
            GROUP BY p.id
            `, [id]);

            if (!post) {
                return res.status(404).send({message: "Post not found"});
            }
            res.json({ post });
    } catch (e){
        return res.status(500).send({message: "Could not fetch post"});
    }
});

router.post("/:id/like", isLoggedIn, async (req, res) =>{
    const { id } = req.params;
    const userId = req.session.user.id;

    try{
        await db.run(`
            INSERT INTO likes (post_id, user_id) VALUES (?,?)`,
            [id, userId]
            );

            const { like_count } = await db.get(
                `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`,
                [id]
            );

            io.emit('like_updated', {postId: Number(id), like_count});
            res.json({likes: true});
    } catch {
        await db.run(`
            DELETE FROM likes WHERE post_id = ? AND user_id = ?`,
        [id, userId]
        );
        const { like_count } = await db.get(
            `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`,
            [id]
        );
        io.emit('like_updated', {postId: Number(id), like_count});
        res.json({liked: false});
    }
});

router.get("/:id/comments", isLoggedIn, async (req, res) =>{
    const { id } = req.params;

    try{
        const comments = await db.all(`
            SELECT c.*, u.username
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
            `, [id]);
            res.json( {comments });
    } catch (e) {
        return res.status(500).send({message: "Could not fetch comments"});
    }
});

router.post("/:id/comments", isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const {content} = req.body;
    const userId = req.session.user.id;

    if(!content){
        return res.status(400).send({message: "Comment cannot be empty!"});
    }

    try{
        await db.run(`
            INSERT INTO comments (post_id, user_id, content)
            VALUES (?, ?, ?)
            `, [id, userId, content]);
            res.status(201).json({message: "Comment posted!"});
    } catch (e){
        return res.status(500).send({message: "Could not post comment"});
    }
});


return router;
}
