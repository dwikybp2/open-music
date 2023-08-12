const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistActivitiesService {
  constructor() {
    this.pool = new Pool();
  }

  async addActivities(playlistId, songId, userId, action) {
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Activities gagal ditambahkan');
    }
  }

  async getActivitiesByPlaylistId(id, userId) {
    const query = {
      text: 'SELECT (SELECT username FROM users WHERE id = $1) AS username, songs.title, action, time FROM playlist_song_activities LEFT JOIN songs ON songs.id = song_id WHERE playlist_id = $2 ORDER BY time',
      values: [userId, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Activities tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = PlaylistActivitiesService;
