const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    let errorMessage = req.flash('error');
    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    } else {
        errorMessage = null;
    }
    res.render('auth/login', {
        pageTitle: "Login",
        path: '/login',
        errorMessage
    });
};

exports.getSignup = (req, res, next) => {
    let errorMessage = req.flash('error');
    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0];
    } else {
        errorMessage = null;
    }
    res.render('auth/signup', {
        pageTitle: "Signup",
        path: '/signup',
        errorMessage
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email }).then(user => {
        if (!user) {
            req.flash('error', 'Invalid Email or Password.');
            return res.redirect('/login');
        }
        bcrypt.compare(password, user.password).then(passwordIsMatch => {
            if (passwordIsMatch) {
                req.session.isLoggedIn = true;
                req.session.user = {
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email
                };
                return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                });
            }
            req.flash('error', 'Invalid Email or Password.');
            res.redirect('/login');
        }).catch(err => {
            console.log(err);
            return res.redirect('/login');
        });
    }).catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    // const confirmPassword = req.body.confirmPassword;
    User.findOne({ email }).then(userDoc => {
        if (userDoc) {
            req.flash('error', 'E-Mail exists already, please pick a different one.');
            return res.redirect('/signup');
        }
        return bcrypt
            .hash(password, 12)
            .then(hashedPassword => {
                const user = new User({ email, password: hashedPassword });
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
            });
    }).catch(err => console.log(err));
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};