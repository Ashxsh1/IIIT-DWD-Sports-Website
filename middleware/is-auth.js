// module.exports = (req, res, next) => {
//     if (!req.session.isLoggedIn) {
//         return res.redirect('/login');
//     }
//     next();
// }



module.exports = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}




// function isAdmin(req, res, next) {
//     if (req.user && req.user.isAdmin) {
//       next();
//     } else {
//       res.status(401).send({ message: 'Admin access only.' });
//     }
//   }
  



// module.exports = (req, res, next) => {
//     // If user is not logged in, redirect to login page
//     if (!req.session.isLoggedIn) {
//         return res.redirect('/login');
//     }
    
//     // If user is not an admin, redirect to home page
//     if (!req.user.isAdmin) {
//         return res.redirect('/');
//     }

//     // If user is an admin, allow access to admin products and add product features
//     // ...
//     next();
// }
