function validateLogin(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['Invalid request body.'];
  }

  const { username, password } = data;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.push('Username or email is required.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }

  return errors;
}

module.exports = { validateLogin };
