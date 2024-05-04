const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  // Get list of users
  route.get('/', authenticationMiddleware, usersControllers.getUsers);

  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(usersValidator.createUser),
    usersControllers.createUser
  );

  // Get user detail
  route.get('/:id', authenticationMiddleware, usersControllers.getUser);

  // Update user
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, usersControllers.deleteUser);

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.changePassword),
    usersControllers.changePassword
  );
  // Endpoint to handle creating purchases
  route.post(
    '/products',
    authenticationMiddleware,
    celebrate(usersValidator.createProducts), // You need to define the validation schema for creating a purchase
    usersControllers.createProducts
  );

  // Endpoint to fetch the list of products
  route.get(
    '/products',
    authenticationMiddleware,
    usersControllers.getProducts
  );

// Endpoint to fetch the list of products
route.get(
  '/product/:id',
  authenticationMiddleware,
  usersControllers.getProduct
);

// Endpoint to handle creating purchases
route.post(
  '/purchases',
  authenticationMiddleware,
  celebrate(usersValidator.createPurchases), // You need to define the validation schema for creating a purchase
  usersControllers.createPurchases
);
  // Endpoint to update a purchase by its ID
  route.put(
    '/purchases/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updatePurchases), // You need to define the validation schema for updating a purchase
    usersControllers.updatePurchases
  );

  // Endpoint to delete a purchase by its ID
  route.delete(
    '/purchases/:id',
    authenticationMiddleware,
    usersControllers.deletePurchases
  );
};
