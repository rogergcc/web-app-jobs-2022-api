module.exports = {
  defaultServerResponse: {
    status: 400,
    message: '',
    body: {}
  },
  playerMessage: {
    PLAYER_CREATED: 'Player Created Successfully',
    PLAYER_FETCHED: 'Player Fetched Successfully',
    PLAYER_UPDATED: 'Player Updated Successfully',
    PLAYER_DELETED: 'Player Deleted Successfully',
    PLAYER_NOT_FOUND: 'Player Not Found'
  },
  productMessage: {
    PRODUCT_CREATED: 'Product Created Successfully',
    PRODUCT_FETCHED: 'Product Fetched Successfully',
    PRODUCT_UPDATED: 'Product Updated Successfully',
    PRODUCT_DELETED: 'Product Deleted Successfully',
    PRODUCT_NOT_FOUND: 'Product Not Found'
  },
  userMessage: {
    SIGNUP_SUCCESS: 'Signup Success',
    LOGIN_SUCCESS: 'Login Success',
    DUPLICATE_EMAIL: 'User already exist with given email',
    USER_NOT_FOUND: 'User not found',
    INVALID_PASSWORD: 'Incorrect Password'
  },
  requestValidationMessage: {
    BAD_REQUEST: 'Invalid fields',
    TOKEN_MISSING: 'Token missing from header'
  },
  databaseMessage: {
    INVALID_ID: 'Invalid Id'
  }
}
