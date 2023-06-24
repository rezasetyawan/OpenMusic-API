const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {usersService, collaborationsService, playlistsService, validator}) => {
    const collaborationsHandler = new CollaborationsHandler(
        usersService, collaborationsService, playlistsService, validator,
    );
    server.route(routes(collaborationsHandler));
  },
};
