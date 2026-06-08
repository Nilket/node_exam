import { Router } from 'express';
import db from '../database/connection.js';
import { isLoggedIn } from '../middleWare/authMiddleware.js';

export default function postsRouter(io) {
    const router = Router();

    router.get("/", isLoggedIn, async (req, res) => {
        const { category } = req.query;

        try {
            const getAllPostsStmt = await db.prepare(`
                SELECT p.*, u.username,
                    COUNT(DISTINCT l.id) AS like_count,
                    COUNT(DISTINCT c.id) AS comment_count
                FROM posts p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN likes l ON l.post_id = p.id
                LEFT JOIN comments c ON c.post_id = p.id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `);

            const getPostsByCategoryStmt = await db.prepare(`
                SELECT p.*, u.username,
                    COUNT(DISTINCT l.id) AS like_count,
                    COUNT(DISTINCT c.id) AS comment_count
                FROM posts p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN likes l ON l.post_id = p.id
                LEFT JOIN comments c ON c.post_id = p.id
                WHERE p.category = ?
                GROUP BY p.id
                ORDER BY p.created_at DESC
            `);

            const posts = category
                ? await getPostsByCategoryStmt.all(category)
                : await getAllPostsStmt.all();

            res.json({ posts });
        } catch (e) {
            console.log(e);
            return res.status(500).send({ message: "Could not fetch posts" });
        }
    });

    router.post("/", isLoggedIn, async (req, res) => {
        const { title, content, category } = req.body;
        const user_id = req.session.user.id;

        if (!title || !content) {
            return res.status(400).send({ message: "Title and content is required" });
        }

        try {
            const insertPostStmt = await db.prepare(`
                INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)
            `);
            const result = await insertPostStmt.run(user_id, title, content, category || null);
            return res.status(201).json({ id: result.lastID });
        } catch (e) {
            console.log(e);
            return res.status(500).send({ message: "Could not create post" });
        }
    });

    router.get("/:id", isLoggedIn, async (req, res) => {
        const { id } = req.params;

        try {
            const getPostByIdStmt = await db.prepare(`
                SELECT p.*, u.username,
                    COUNT(DISTINCT l.id) AS like_count,
                    COUNT(DISTINCT c.id) AS comment_count
                FROM posts p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN likes l ON l.post_id = p.id
                LEFT JOIN comments c ON c.post_id = p.id
                WHERE p.id = ?
                GROUP BY p.id
            `);
            const post = await getPostByIdStmt.get(id);

            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }
            res.json({ post });
        } catch (e) {
            console.log(e);
            return res.status(500).send({ message: "Could not fetch post" });
        }
    });

    router.delete("/:id", isLoggedIn, async (req, res) =>{
        const { id } = req.params;
        const userId = req.session.user.id;

        try{
            const getPostByIdStmt = await db.prepare(`SELECT * FROM posts WHERE id = ?`);
            const post = await getPostByIdStmt.get(id);

            if(!post){
                return res.status(404).send({message: "Post not found!"});
            }

            if(post.user_id !== userId){
                return res.status(403).send({message: "Not your post!"});
            }

            const deletePostStmt = await db.prepare(`DELETE FROM posts WHERE id = ?`);
            await deletePostStmt.run(id);

            res.json({message: "Post deleted!"});
        } catch (e) {
            return res.status(500).send({message: "Could not delete post"});
        }
    });

    router.put("/:id", isLoggedIn, async (req, res) =>{
        const { id } = req.params;
        const { title, content, category } = req.body;
        const userId = req.session.user.id;


        if(!title || !content){
            return res.status(400).send({message: "Title and content is required"});
        }

        try {
            const getPostByIdStmt = await db.prepare(`SELECT * FROM posts WHERE id = ?`);
            const post = await getPostByIdStmt.get(id);

            if(!post){
                return res.status(404).send({message: "Post not found"});
            }

            if(post.user_id !== userId){
                return res.status(403).send({message: "Not your post!"});
            }

            const updatePostStmt = await db.prepare(`
                UPDATE posts SET title = ?, content = ?, category = ? WHERE id = ?
                `);

                await updatePostStmt.run(title, content, category || null, id);
                res.json({message: "Post updated!"});
        } catch (e){
            console.log(e);
            return res.status(500).send({message: "Could not update post!"});
        }
    });

    router.post("/:id/like", isLoggedIn, async (req, res) => {
        const { id } = req.params;
        const userId = req.session.user.id;

        try {
            const insertLikeStmt = await db.prepare(`INSERT INTO likes (post_id, user_id) VALUES (?, ?)`);
            await insertLikeStmt.run(id, userId);

            const getLikeCountStmt = await db.prepare(`SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`);
            const { like_count } = await getLikeCountStmt.get(id);

            io.emit('like_updated', { postId: Number(id), like_count });
            res.json({ liked: true });
        } catch {
            const deleteLikeStmt = await db.prepare(`DELETE FROM likes WHERE post_id = ? AND user_id = ?`);
            await deleteLikeStmt.run(id, userId);

            const getLikeCountStmt = await db.prepare(`SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`);
            const { like_count } = await getLikeCountStmt.get(id);

            io.emit('like_updated', { postId: Number(id), like_count });
            res.json({ liked: false });
        }
    });

    router.get("/:id/comments", isLoggedIn, async (req, res) => {
        const { id } = req.params;

        try {
            const getCommentsByPostStmt = await db.prepare(`
                SELECT c.*, u.username
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.created_at ASC
            `);
            const comments = await getCommentsByPostStmt.all(id);
            res.json({ comments });
        } catch (e) {
            console.log(e);
            return res.status(500).send({ message: "Could not fetch comments" });
        }
    });

    router.post("/:id/comments", isLoggedIn, async (req, res) => {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.session.user.id;

        if (!content) {
            return res.status(400).send({ message: "Comment cannot be empty!" });
        }

        try {
            const insertCommentStmt = await db.prepare(`
                INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)
            `);
            await insertCommentStmt.run(id, userId, content);

            const getCommentsByPostStmt = await db.prepare(`
                SELECT c.*, u.username
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.created_at ASC
            `);
            const comments = await getCommentsByPostStmt.all(id);

            io.emit('comments_updated', { postId: Number(id), comments });
            return res.status(201).json({ message: "Comment posted!" });
        } catch (e) {
            console.log(e);
            return res.status(500).send({ message: "Could not post comment" });
        }
    });

    router.delete("/:id/comments/:commentId", isLoggedIn, async (req, res) => {
        const { id, commentId } = req.params;
        const userId = req.session.user.id;

        try {
            const getCommentByIdStmt = await db.prepare(`SELECT * FROM comments WHERE id = ?`);
            const comment = await getCommentByIdStmt.get(commentId);

            if (!comment) {
                return res.status(404).send({ message: "Comment not found" });
            }

            if (comment.user_id !== userId) {
                return res.status(403).send({ message: "Not your comment" });
            }

            const deleteCommentStmt = await db.prepare(`DELETE FROM comments WHERE id = ?`);
            await deleteCommentStmt.run(commentId);

            const getCommentsByPostStmt = await db.prepare(`
                SELECT c.*, u.username
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.created_at ASC
            `);
            const comments = await getCommentsByPostStmt.all(id);

            io.emit('comments_updated', { postId: Number(id), comments });
            res.json({ message: "Comment deleted" });
        } catch (e) {
            console.log(e);
            return res.status(500).send({ message: "Could not delete comment!" });
        }
    });

    return router;
}