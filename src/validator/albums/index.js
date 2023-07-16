const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, SongPayloadSchema } = require('./schema');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error);
    }
  },

  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error);
    }
  },
};

module.exports = AlbumValidator;
