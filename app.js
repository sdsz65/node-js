const path = require('path');

const express = require('express');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("6a9f0202ee01c4a3b947cc0c").then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(`mongodb://localhost:27017/shop?retryWrites=true`).then(result => {
    User.findOne().then(user => {
        if (!user) {
            const user = new User({ name: "Davood", email: "davood@test.com", cart: { items: [] } });
            user.save();
        }
    })
    app.listen(3000);
}).catch(err => console.log(err));