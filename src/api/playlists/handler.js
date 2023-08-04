const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(songsService, playlistsService, validator) {
    this.songsService = songsService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    autoBind(this);
  }

  async postPlaylistsHandler(request, h) {
    this.validator.validatePlaylistPayload(request.payload);

    const ownerId = request.auth.credentials.id;
    const playlistId = await this.playlistsService.addPlaylist(ownerId, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const userId = request.auth.credentials.id;

    const playlists = await this.playlistsService.getPlaylist(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const userId = request.auth.credentials.id;

    await this.playlistsService.verifyPlaylistOwner(id, userId);
    await this.playlistsService.deletePlaylistById(id, userId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this.validator.validateSongToPlaylistPayload(request.payload);

    const userId = request.auth.credentials.id;
    const { id } = request.params;
    const { songId } = request.payload;

    await this.songsService.getSongById(songId);
    await this.playlistsService.verifyPlaylistOwner(id, userId);

    await this.playlistsService.addSongToPlaylist(id, request.payload);
    await this.playlistsService.addActivities(id, songId, userId, 'add');

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongByPlaylistHandler(request) {
    const { id } = request.params;
    const userId = request.auth.credentials.id;

    await this.playlistsService.verifyPlaylistOwner(id, userId);
    const playlist = await this.playlistsService.getPlaylistSongById(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongPlaylistBySongIdHandler(request) {
    this.validator.validateSongToPlaylistPayload(request.payload);

    const { id } = request.params;
    const userId = request.auth.credentials.id;

    await this.playlistsService.verifyPlaylistOwner(id, userId);
    const songId = await this.playlistsService.deleteSongPlaylistBySongId(id, request.payload);
    await this.playlistsService.addActivities(id, songId, userId, 'delete');

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesByPlaylistIdHandler(request) {
    const { id } = request.params;
    const userId = request.auth.credentials.id;

    await this.playlistsService.verifyPlaylistOwner(id, userId);
    const activities = await this.playlistsService.getActivitiesByPlaylistId(id, userId);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
