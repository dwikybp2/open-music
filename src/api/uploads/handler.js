const autoBind = require('auto-bind');
const config = require('../../utils/config');

class UploadsHandler {
  constructor(albumsService, storageService, validator) {
    this.storageService = storageService;
    this.validator = validator;
    this.albumsService = albumsService;

    autoBind(this);
  }

  async postCoverAlbumsHandler(request, h) {
    const { cover } = request.payload;
    this.validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this.storageService.writeFile(cover, cover.hapi);
    const { id } = request.params;
    const fileUrl = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;

    await this.albumsService.editAlbumCoverById(id, fileUrl);

    const response = h.response({
      status: 'success',
      message: 'Cover album berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
