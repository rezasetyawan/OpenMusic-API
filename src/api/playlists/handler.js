class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const {name} = request.payload;
    const {id: credentialId} = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({name, owner: credentialId});

    const response = h.response({
      status: 'success',
      message: 'Playlist added successfully :D',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist deleted successfully :D',
    };
  }

  async postSongHandler(request, h) {
    this._validator.validatePostSongPayload(request.payload);

    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;
    const {songId} = request.payload;
    const action = 'add';

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.getSongById(songId);

    await this._playlistsService.addSongToPlaylist({playlistId, songId});

    await this._playlistsService.addActivityToPlaylistActivities({playlistId, songId, userId: credentialId, action});

    const response = h.response({
      status: 'success',
      message: 'Successfully add song to playlist',

    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistsService.getSongsFromPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongByIdHandler(request, h) {
    this._validator.validateDeleteSongPayload(request.payload);

    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;
    const {songId} = request.payload;
    const action = 'delete';

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

    await this._playlistsService.addActivityToPlaylistActivities({playlistId, songId, userId: credentialId, action});

    return {
      status: 'success',
      message: 'Successfully delete song to playlist',
    };
  }

  async getActivitiesHandler(request, h) {
    const {id: playlistId} = request.params;
    const {id: credentialId} = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._playlistsService.getPlaylistActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
