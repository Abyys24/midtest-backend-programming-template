const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { products } = require('../../../models');
const { purchases } = require('../../../models');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers() {
  const users = await usersRepository.getUsers();

  const results = users.map(user => ({  // Menggunakan metode map untuk menghasilkan array hasil
    id: user.id,
    name: user.name,
    email: user.email,
  }));

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

async function getUsersWithPagination(
  page_number = 1,
  page_size = 10,
  sort = 'email:asc',
  search
) {
  const filter = createFilter(search);
  const sortOptions = createSortOptions(sort);
  const { total_pages, users } = await getUsersData(
    page_number,
    page_size,
    filter,
    sortOptions
  );

  return {
    page_number: parseInt(page_number),
    page_size: parseInt(page_size),
    count: users.length,
    total_pages,
    has_previous_page: page_number > 1,
    has_next_page: page_number < total_pages,
    data: users,
  };
}

function createFilter(search) {
  let filter = {};
  if (search) {
    filter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };
  }
  return filter;
}

function createSortOptions(sort) {
  let sortField = 'email';
  let sortOrder = 1;
  if (sort) {
    const [field, order] = sort.split(':');
    sortField = field;
    sortOrder = order === 'desc' ? -1 : 1;
  }
  return { [sortField]: sortOrder };
}

async function getUsersData(page_number, page_size, filter, sortOptions) {
  const total_count = await usersRepository.getUserCount(filter);
  const total_pages = Math.ceil(total_count / page_size);
  const skip = (page_number - 1) * page_size;
  const users = await usersRepository.getUsers(
    page_size,
    skip,
    filter,
    sortOptions
  );

  return { total_pages, users };
}

/**
 * Create new products
 * @param {string} name - Name
 * @param {string} price - Price
 * @param {string} quantity - Quantity
 * @returns {boolean}
 */
async function createProducts(name, price, quantity) {

  try {
    const newProducts = await usersRepository.createProducts(name, price, quantity);
    await newProducts.save()
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Get list of products
 * @returns {Array}
 */
async function getProducts() {
  const products = await usersRepository.getProducts();

  const results = [];
  for (let i = 0; i < products.length; i += 1) {
    const product = products[i];
    results.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    });
  }

  return results;
}


/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getProduct(id) {
  const product = await usersRepository.getProduct(id);

  // User not found
  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
  };
}

/**
 * Create new products
 * @param {string} name - Name
 * @param {string} price - Price
 * @param {string} quantity - Quantity
 * @returns {boolean}
 */
async function createPurchases(name, price, quantity) {

  try {
    const newPurchases = await usersRepository.createPurchases(name, price, quantity);
    await newPurchases.save()
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updatePurchases(id, name, quantity, price) {
  const purchases = await usersRepository.getPurchases(id);

  // User not found
  if (!purchases) {
    return null;
  }

  try {
    await usersRepository.updatePurchases(id, name, quantity, price);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete purchases
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deletePurchases(id) {
  const user = await usersRepository.getPurchases(id);

  // Purchases not found
  if (!purchases) {
    return null;
  }

  try {
    await usersRepository.deletePurchases(id);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
  createProducts,
  getProducts,
  getProduct,
  createPurchases,
  updatePurchases,
  deletePurchases,
};
