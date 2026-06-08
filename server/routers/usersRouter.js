import { Router } from 'express';
import db from '../database/connection.js';
import { isLoggedIn } from '../middleWare/authMiddleware.js';

const router = Router();

router.get("/:username", isLoggedIn, async (req, res) => {
    const { username } = req.params;

    try {
        const getUserStmt = await db.prepare(`SELECT id, username, email, first_name, last_name FROM users WHERE username = ?`);
        const user = await getUserStmt.get(username);

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const getUserPostsStmt = await db.prepare(`
            SELECT posts.*,
                COUNT(DISTINCT likes.id) AS like_count,
                COUNT(DISTINCT comments.id) AS comment_count
            FROM posts
            LEFT JOIN likes ON likes.post_id = posts.id
            LEFT JOIN comments ON comments.post_id = posts.id
            WHERE posts.user_id = ?
            GROUP BY posts.id
            ORDER BY posts.created_at DESC
        `);
        const posts = await getUserPostsStmt.all(user.id);

        const getStatsStmt = await db.prepare(`
            SELECT
                COUNT(DISTINCT posts.id) AS post_count,
                COUNT(DISTINCT likes.id) AS total_likes,
                COUNT(DISTINCT comments.id) AS total_comments
            FROM posts
            LEFT JOIN likes ON likes.post_id = posts.id
            LEFT JOIN comments ON comments.post_id = posts.id
            WHERE posts.user_id = ?
        `);
        const stats = await getStatsStmt.get(user.id);

        res.json({ user, posts, stats });
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: "Could not fetch profile" });
    }
});

export default router;