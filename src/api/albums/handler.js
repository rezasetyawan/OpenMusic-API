class AlbumsHandler {
  constructor(albumsService, storageService, albumsValidator, uploadsValidator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._albumsValidator = albumsValidator;
    this._uploadsValidator = uploadsValidator;
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const albumId = await this._albumsService.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album added successfully :D',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const {id} = request.params;
    const album = await this._albumsService.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const {id} = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album updated successfully :D',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const {id} = request.params;

    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album deleted successfully :D',
    };
  }

  async postUploadAlbumCoverHandler(request, h) {
    const {cover} = request.payload;
    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const {id: albumId} = request.params;

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/album_cover/${filename}`;

    await this._albumsService.editAlbumCoverById(albumId, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Cover uploaded successfully',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikeByIdHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const {id: albumId} = request.params;

    const {status, responseCode, message} = await this._albumsService.addLikeToAlbumById(albumId, credentialId);
    const response = h.response({
      status: status,
      message: message,
    });
    response.code(responseCode);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const {id: albumId} = request.params;

    const {source, likeCounts: likes} = await this._albumsService.getAlbumLikesById(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.header('X-Data-Source', source);
    response.code(200);
    return response;
  }

  async deleteAlbumLikeByIdHandler(request, h) {
    const {id: credentialId} = request.auth.credentials;
    const {id: albumId} = request.params;

    await this._albumsService.deleteAlbumLikeById(albumId, credentialId);

    return {
      status: 'success',
      message: 'Unlike album',
    };
  }
}

module.exports = AlbumsHandler;
