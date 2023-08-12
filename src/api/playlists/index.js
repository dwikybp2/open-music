const PlaylistsHandler = require('./handler');
const routes = require('./route');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    songsService,
    playlistActivitiesService,
    playlistsService,
    validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      songsService,
      playlistActivitiesService,
      playlistsService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
