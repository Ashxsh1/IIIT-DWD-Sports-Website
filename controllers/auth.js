const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const order = require("../models/order");
const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: '',
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password.",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "ashishgidijala@gmail.com",
        subject: " Successful Sign Up into IIIT Dharwad Sports Website",
        html: `
               <p>Dear Student,</p>

               <p>I am pleased to inform you that your sign up process into the IIIT Dharwad Sports website has been successfully completed. You are now a registered member of our sports website, and you can access all the features and benefits available to our users.
               <p>With your account, you can view the latest sports news, updates, and schedules of various sports events happening at IIIT Dharwad. You can also book sports facilities, participate in tournaments and events, and connect with other sports enthusiasts in our community.
               We are committed to providing you with the best sports experience possible, and we hope that you will take full advantage of the resources available on our website.</p>
               <p>If you have any questions or concerns, please do not hesitate to contact us. We are here to help you in any way we can.</p>
               
               <p>Best Regards,</p>
               <p>IIIT Dharwad Sports Committee</p>
               
               <img src="images\logo.png" alt="Footer"> <!-- Footer image -->`,
      });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "ashishgidijala@gmail.com",
          subject: "Password reset",
          html: `
            <p>Dear Student,</p>

            <p>We have received your request to reset your password for the IIIT Dharwad Sports website. We understand how important it is for you to access the site and enjoy its features, and we are happy to assist you in resetting your password.
            
            <p>Please click on the following link to reset your password: <a href="http://localhost:3000/reset/${token}">PASSWORD RESET LINK</a>. This link will direct you to the password reset page on our website, where you can enter your new password and confirm the changes.</p>
            
            <p>Please note that the password reset link will only be valid for a limited time, so we encourage you to reset your password as soon as possible. Also, for security reasons, we recommend that you choose a strong and unique password that is not easily guessed.</p>
            
            <p>If you did not initiate this password reset request or have any concerns, please contact us immediately so that we can investigate the matter and ensure that your account is secure.</p>
            
            <p>Thank you for your cooperation, and we hope that you continue to enjoy using the IIIT Dharwad Sports website.</p>
            
            <p>Best Regards,</p>
            <p>IIIT Dharwad Sports Committee</p>`,
        });
      }).then(() => {
        console.log("Mail Sent for Password Reset!")
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  const orderId = req.orderId.toString();
  order.findById(orderId).then((order) => {
    let productsHtml = "";
    for (let i = 0; i < order.products.length; i++) {
      const product = order.products[i].product;
      const quantity = order.products[i].quantity;
      productsHtml += `<li>Product Name: ${product.title}, Quantity: ${quantity}</li>`;
    }
    transporter.sendMail({
      to: "21bds007@iiitdwd.ac.in",
      from: "ashishgidijala@gmail.com",
      subject: "Procurement Request",
      html: `<p>New Procurement Request!</p>
             <p>This is the content of the email.</p>
             <p>Procurement Details:</p>
             <ul>
               ${productsHtml}
             </ul>
             <p>Date: ${new Date().toLocaleString()}</p>
             <img src="images\\logo.png" alt="Footer">`,
    }).then(() => {
      console.log("Mail Sent for Order ID: ", orderId);
      });
    })
    };

