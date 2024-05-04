const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { User, products } = require('../../../models');
const { purchases } = require('../../../models');
/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const {
      page_number = 1,
      page_size = 10,
      sort = 'email:asc',
      search,
    } = request.query;

    let users;
    let count;

    if (page_number && page_size && sort) {
      let filter = {};
      if (search) {
        const [columnName, searchValue] = search.split(':');
        if (columnName && searchValue) {
          filter = {
            [columnName]: { $regex: searchValue, $options: 'i' },
          };
        }
      }

      let sortField = 'email';
      let sortOrder = 1;
      if (sort) {
        const [field, order] = sort.split(':');
        sortField = field;
        sortOrder = order === 'desc' ? -1 : 1;
      }
      const sortOptions = { [sortField]: sortOrder };

      count = await User.countDocuments(filter);
      users = await getUsersWithPagination(
        filter,
        sortOptions,
        parseInt(page_number),
        parseInt(page_size)
      );
    } else {
      users = await usersService.getUsers();
      count = users.length;
    }

    const total_pages = Math.ceil(count / page_size);
    const has_previous_page = page_number > 1;
    const has_next_page = page_number < total_pages;

    response.json({
      page_number: parseInt(page_number),
      page_size: parseInt(page_size),
      count,
      total_pages,
      has_previous_page,
      has_next_page,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

async function getUsersWithPagination(
  filter,
  sortOptions,
  page_number,
  page_size
) {
  const skip = (page_number - 1) * page_size;
  const users = await User.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(page_size);

  return users;
}
/**
 * Handle create purchase request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createProducts(request, response, next) {
  try {
    const name = request.body.name;
    const price = request.body.price;
    const quantity = request.body.quantity;

    const success = await usersService.createProducts(name, price, quantity);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create products'
      );
    }
    // Logic to create purchase
    // Example: const purchase = await purchaseService.createPurchase(request.body);
    return response.status(201).json({ message: 'Purchase created successfully' });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get list of products request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getProducts(request, response, next) {
  try {
    const products = await usersService.getProducts();
    return response.status(200).json(products);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getProduct(request, response, next) {
  try {
    const product = await usersService.getProduct(request.params.id);

    if (!product) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown product');
    }

    return response.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle purchases user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deletePurchases(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deletePurchases(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete purchases'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create purchase request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createPurchases(request, response, next) {
  try {
    const name = request.body.name;
    const price = request.body.price;
    const quantity = request.body.quantity;

    const success = await usersService.createPurchases(name, price, quantity);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create products'
      );
    }
    // Logic to create purchase
    // Example: const purchase = await purchaseService.createPurchase(request.body);
    return response.status(201).json({ message: 'Purchase created successfully' });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update purchases request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updatePurchases(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const quantity = request.body.quantity;
    const price = request.body.price;

    const success = await usersService.updatePurchases(id, name, quantity, price);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update purchases'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}
module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  createProducts,
  deletePurchases,
  getProducts,
  getProduct,
  createPurchases,
  updatePurchases,
};
