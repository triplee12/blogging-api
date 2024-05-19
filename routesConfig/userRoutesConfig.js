const userRoutesConfig = [
    { method: 'POST', path: '/auth/signup', description: 'User signup' },
    { method: 'POST', path: '/auth/login', description: 'User login' },
    { method: 'PUT', path: '/users/:id', description: 'Update user account' },
    { method: 'DELETE', path: '/users/:id', description: 'Delete user account' }
];

module.exports = userRoutesConfig;