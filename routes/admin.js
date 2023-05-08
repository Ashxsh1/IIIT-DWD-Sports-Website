const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAdmin, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAdmin, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  isAdmin,
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAdmin, adminController.getEditProduct);

router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAdmin,
  adminController.postEditProduct
);

router.delete('/product/:productId', isAdmin, adminController.deleteProduct);

module.exports = router;
