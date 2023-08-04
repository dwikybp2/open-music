const autoBind = require('auto-bind');

class CollaborationsService {
  constructor(playlistsService, usersService, collaborationsService, validator) {
    this.playlistsService = playlistsService;
    this.usersService = usersService;
    this.collaborationsService = collaborationsService;
    this.validator = validator;

    autoBind(this);
  }

  async postCollaborationsHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const owner = request.auth.credentials.id;

    await this.playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this.usersService.getUserById(userId);
    const collaborationId = await this.collaborationsService.addCollaboration(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationsHandler(request) {
    this.validator.validateCollaborationPayload(request.payload);

    const { playlistId } = request.payload;
    const owner = request.auth.credentials.id;

    await this.playlistsService.verifyPlaylistOwner(playlistId, owner);
    await this.collaborationsService.deleteCollaboration(request.payload, owner);

    return {
      status: 'success',
      message: 'Collaboration telah dihapus dari playlist',
    };
  }
}

module.exports = CollaborationsService;
