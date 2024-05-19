const commentRoutesConfig = [
    { method: 'POST', path: '/comments', description: 'Create a new comment' },
    { method: 'GET', path: '/comments/:id', description: 'Get comments by blog ID' },
    { method: 'DELETE', path: '/comments/:id', description: 'Delete a comment' }
];

module.exports = commentRoutesConfig;