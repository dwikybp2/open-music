const AlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albumLikes',
  version: '1.0.0',
  register: async (server, { albumsService, albumLikesService }) => {
    const albumLikesHandler = new AlbumLikesHandler(albumsService, albumLikesService);
    server.route(routes(albumLikesHandler));
  },
};
