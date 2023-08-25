const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addAlbumLikes(userId, albumId) {
    const id = `albumLikes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal di likes');
    }

    await this.cacheService.delete(`likes-${albumId}`);

    return result.rows[0].id;
  }

  async deleteAlbumLikes(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album likes gagal dihapus. Id tidak ditemukan');
    }

    await this.cacheService.delete(`likes-${albumId}`);
  }

  async getAlbumLikesById(id) {
    const cache = await this.cacheService.get(`likes-${id}`);

    if (cache !== null) {
      return {
        source: 'cache',
        value: JSON.parse(cache),
      };
    }

    const query = {
      text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    await this.cacheService.set(`likes-${id}`, JSON.stringify(result.rows[0].likes));

    return {
      value: result.rows[0].likes,
    };
  }

  async verifyAlbumLikes(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this.pool.query(query);

    if (result.rowCount) {
      throw new InvariantError('User hanya bisa likes album 1x');
    }
  }
}

module.exports = AlbumLikesService;
