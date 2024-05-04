const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const { createProducts, createPurchases } = require('./users-repository');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },

  updateUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
    },
  },

  changePassword: {
    body: {
      password_old: joi.string().required().label('Old password'),
      password_new: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('New password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },
  createProducts: {
    body: {
      name: joi.string().required().label('Product Name'),
      quantity: joi.number().integer().min(1).required().label('Quantity'),
      price: joi.number().min(0).required().label('Price'),
      // Add more validation rules as needed for other fields such as price, etc.
    },
  },

  createPurchases: {
    body: {
      name: joi.string().required().label('Product Name'),
      quantity: joi.number().integer().min(1).required().label('Quantity'),
      price: joi.number().min(0).required().label('Price'),
      // Add more validation rules as needed for other fields such as price, etc.
    },
  },
  
  updatePurchases: {
    body: {
      name: joi.string().label('Product Name'),
      quantity: joi.number().integer().min(1).label('Quantity'),
      price: joi.number().min(0).label('Price'),
      // Add more validation rules as needed for other fields that can be updated
    },
  },
};
