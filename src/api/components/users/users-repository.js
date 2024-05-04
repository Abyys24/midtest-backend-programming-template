const { User, purchases } = require('../../../models');
const { products } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

/**
 * Create new products
 * @param {string} name - Name
 * @param {string} price - Price
 * @param {string} quantity - Quantity
 * @returns {Promise}
 */
async function createProducts(name, price, quantity) {
  return products.create({
    name,
    price,
    quantity,
  });
}

/**
 * Get a list of products
 * @returns {Promise}
 */
async function getProducts() {
  return products.find({});
}
/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getProduct(id) {
  return products.findById(id);
}

/**
 * Create new products
 * @param {string} name - Name
 * @param {string} price - Price
 * @param {string} quantity - Quantity
 * @returns {Promise}
 */
async function createPurchases(name, price, quantity) {
  return purchases.create({
    name,
    price,
    quantity,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updatePurchases(id, name, quantity, price) {
  return purchases.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        quantity,
        price,
      },
    }
  );
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getPurchases(id) {
  return purchases.findById(id);
}

/**
 * Delete a purchases
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deletePurchases(id) {
  return User.deleteOne({ _id: id });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  createProducts,
  getProducts,
  getProduct,
  createPurchases,
  updatePurchases,
  getPurchases,
  deletePurchases,
};
