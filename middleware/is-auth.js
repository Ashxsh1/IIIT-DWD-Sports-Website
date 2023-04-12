module.exports = (req, res, next) => {
    // console.log('hi');
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}
