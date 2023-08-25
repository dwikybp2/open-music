const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(albumsService, albumLikesService) {
    this.albumsService = albumsService;
    this.albumLikesService = albumLikesService;

    autoBind(this);
  }

  async postAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const userId = request.auth.credentials.id;

    await this.albumsService.getAlbumById(id);
    await this.albumLikesService.verifyAlbumLikes(userId, id);
    await this.albumLikesService.addAlbumLikes(userId, id);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikesHandler(request) {
    const { id } = request.params;
    const userId = request.auth.credentials.id;

    await this.albumLikesService.deleteAlbumLikes(userId, id);

    return {
      status: 'success',
      message: 'Likes telah dihapus',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    const likes = await this.albumLikesService.getAlbumLikesById(id);

    const likesNumber = parseInt(likes.value, 10);

    const response = h.response({
      status: 'success',
      data: {
        likes: likesNumber,
      },
    });
    if (likes.source === 'cache') {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumLikesHandler;
