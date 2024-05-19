const blogRoutesConfig = [
    { method: 'POST', path: '/blogs', description: 'Create a new blog' },
    { method: 'GET', path: '/blogs/user', description: 'Get blogs by user' },
    { method: 'GET', path: '/blogs/published', description: 'Get all published blogs' },
    { method: 'GET', path: '/blogs/published/:id', description: 'Get published blog by ID' },
    { method: 'PUT', path: '/blogs/:id/update', description: 'Update a blog by ID' },
    { method: 'DELETE', path: '/blogs/:id/delete', description: 'Delete a blog by ID' }
];

module.exports = blogRoutesConfig;
