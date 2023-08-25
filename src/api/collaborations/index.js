const CollaborationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    usersService,
    collaborationsService,
    validator,
  }) => {
    const collaborationsHandler = new CollaborationsHandler(
      playlistsService,
      usersService,
      collaborationsService,
      validator,
    );
    server.route(routes(collaborationsHandler));
  },
};
