module.exports = (req, res, next) => {
    // console.log('ADMIN');
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }else if(req.user.role !== 'admin'){
        return res.redirect('/login');
    }
    next();
}
