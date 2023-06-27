const {nanoid} = require('nanoid');
const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {mapAlbumDBToModel} = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool;
    this._cacheService = cacheService;
  }

  async addAlbum({name, year}) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add album');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const songQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(albumQuery);
    const albumSongs = await this._pool.query(songQuery);

    if (!result.rowCount) {
      throw new NotFoundError('Album not found');
    }

    return {
      ...result.rows.map(mapAlbumDBToModel)[0],
      songs: albumSongs.rows,
    };
  }

  async editAlbumById(id, {name, year}) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to update album. Id not found');
    }
  }

  async editAlbumCoverById(id, fileLocation) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [fileLocation, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to update album. Id not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Failed to delete album. Id not found');
    }
  }


  async isAlbumExist(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album not found');
    }
  }

  async addLikeToAlbumById(albumId, userId) {
    await this.isAlbumExist(albumId);
    const id = `albumlike-${nanoid(16)}`;
    let status = 'fail';
    let message = 'Cannot like same album twice';
    let responseCode = 400;

    const isAlbumLikedQuery = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const isAlbumLiked = (await this._pool.query(isAlbumLikedQuery)).rowCount;

    if (!isAlbumLiked) {
      const postLikeQuery = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };

      const postLikeResult = await this._pool.query(postLikeQuery);

      if (!postLikeResult.rowCount) {
        throw new InvariantError('Failed to like album');
      }

      status= 'success';
      message = 'Album liked';
      responseCode = 201;
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
    return {status, responseCode, message};
  }

  async deleteAlbumLikeById(albumId, userId) {
    await this.isAlbumExist(albumId);

    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const deleteLikeResult = await this._pool.query(query);

    if (!deleteLikeResult.rowCount) {
      throw new InvariantError('Failed to unlike album');
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
  }

  async getAlbumLikesById(albumId) {
    try {
      const source = 'cache';
      const likeCounts = await this._cacheService.get(`user_album_likes:${albumId}`);
      return {source, likeCounts: +likeCounts};
    } catch (error) {
      await this.isAlbumExist(albumId);

      const source = 'server';
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const likeCounts = result.rowCount;

      await this._cacheService.set(`user_album_likes:${albumId}`, likeCounts);

      return {source, likeCounts};
    }
  }
};

module.exports = AlbumsService;
