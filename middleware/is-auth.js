module.exports = (req, res, next) => {
    // console.log('AUTH');
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}
