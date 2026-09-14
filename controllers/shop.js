const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/product-list', {
      pageTitle: "All Products",
      path: '/products',
      prods: products
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/index', {
      pageTitle: "Shop",
      path: '/',
      prods: products
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId').then(user => {
    const products = user.cart.items;
    res.render('shop/cart', {
      pageTitle: "Your Cart",
      path: '/cart',
      products: products
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
    res.redirect('/cart');
    console.log("result", result);
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId).then(product => {
    res.redirect('/cart');
  }).catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  const order = new Order({
    products: req.user.cart.items.map(item => ({
      quantity: item.quantity,
      product: item.productId
    })),
    user: {
      email: req.user.email,
      userId: req.user._id
    }
  });
  order.save().then(result => {
    return req.user.clearCart();
  }).then(result => {
    res.redirect('/orders');
  }).catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id }).populate('products.product').then(orders => {
    res.render('shop/orders', {
      pageTitle: "Your Order",
      path: '/orders',
      orders: orders
    });
  }).catch(err => console.log(err));
};
