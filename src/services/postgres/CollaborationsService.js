const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
  constructor(playlistsService) {
    this.pool = new Pool();
    this.playlistsService = playlistsService;
  }

  async addCollaboration({ playlistId, userId }) {
    const id = `collaboration-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Collaboration gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration({ playlistId, userId }, owner) {
    const playlist = await this.playlistsService.getPlaylistById(playlistId);

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak menghapus collaboration');
    }

    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Collaborations tidak ditemukan');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT id FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('Kolaborasi gagal diverifikasi');
    }
    return true;
  }

  async getCollaboration(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Collaborations tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = CollaborationsService;
