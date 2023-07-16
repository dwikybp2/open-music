const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongsHandler,
  },
  {
    method: 'GET',
    path: '/songs{title?}',
    handler: handler.getSongsHandler,
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler,
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler,
  },
];

module.exports = routes;
