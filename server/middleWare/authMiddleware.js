export const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ data: { errorMessage: "User is not logged in" } });
    }
    next();
};