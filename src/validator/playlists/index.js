const InvariantError = require('../../exceptions/InvariantError');
const {PlaylistPayloadSchema, PostSongToPlaylistPayloadSchema, DeleteSongFromPlaylistPayloadSchema} = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostSongPayload: (payload) => {
    const validationResult = PostSongToPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteSongPayload: (payload) => {
    const validationResult = DeleteSongFromPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};


module.exports = PlaylistsValidator;
