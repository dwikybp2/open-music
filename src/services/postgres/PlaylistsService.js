const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapGetPlaylist } = require('../../utils');

class PlaylistsService {
  constructor(collaborationsService) {
    this.pool = new Pool();
    this.collaborationsService = collaborationsService;
  }

  async addPlaylist(ownerId, { name }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, ownerId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Palylist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylist(userId) {
    const query = {
      text: 'SELECT playlists.id, collaborations.user_id, playlists.name, users.username, owner FROM playlists LEFT JOIN users ON users.id = owner LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id WHERE owner = $1 OR collaborations.user_id = $1',
      values: [userId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      return result.rows.map(mapGetPlaylist);
    }

    const playlist = result.rows[0];

    if (playlist.owner !== userId && playlist.user_id !== userId) {
      throw new AuthorizationError('Anda tidak memiliki akses ke rsource ini');
    }

    return result.rows.map(mapGetPlaylist);
  }

  async deletePlaylistById(id, userId) {
    const playlist = await this.getPlaylistById(id);

    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak menghapus playlist');
    }

    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak diemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      const isCollaborator = await this.collaborationsService.verifyCollaborator(id, owner);
      if (isCollaborator !== true) {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
    }
  }

  async addSongToPlaylist(playlistId, { songId }) {
    const id = `playlistSong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongById(playlistId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists_songs RIGHT JOIN playlists ON playlists.id = playlist_id RIGHT JOIN users ON users.id = playlists.owner WHERE playlist_id = $1 GROUP BY playlists.id, playlists.name, users.username',
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Tidak ada lagu dalam playlist');
    }

    const songs = await this.getSongByPlaylist(playlistId);
    result.rows[0].songs = songs;

    return result.rows[0];
  }

  async getSongByPlaylist(playlistId) {
    const query = {
      text: 'SELECT songs.id, title, performer FROM songs LEFT JOIN playlists_songs ON song_id = songs.id WHERE playlist_id = $1 GROUP BY songs.id',
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows;
  }

  async deleteSongPlaylistBySongId(playlistId, { songId }) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id lagu tidak ditemukan dalam playlist');
    }

    return songId;
  }

  // async addActivities(playlistId, songId, userId, action) {
  //   const id = `activities-${nanoid(16)}`;
  //   const time = new Date().toISOString();

  //   const query = {
  //     text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
  //     values: [id, playlistId, songId, userId, action, time],
  //   };

  //   const result = await this.pool.query(query);

  //   if (!result.rowCount) {
  //     throw new InvariantError('Activities gagal ditambahkan');
  //   }
  // }

  // async getActivitiesByPlaylistId(id, userId) {
  //   const query = {
  //     text: 'SELECT (SELECT username FROM users WHERE id = $1) AS username, songs.title, action, time FROM playlist_song_activities LEFT JOIN songs ON songs.id = song_id WHERE playlist_id = $2 ORDER BY time',
  //     values: [userId, id],
  //   };

  //   const result = await this.pool.query(query);

  //   if (!result.rowCount) {
  //     throw new NotFoundError('Activities tidak ditemukan');
  //   }

  //   return result.rows;
  // }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = PlaylistsService;
