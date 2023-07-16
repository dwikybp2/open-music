const mapDBToModel = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapGetSong = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapGetSongById = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

module.exports = {
  mapDBToModel,
  mapGetSong,
  mapGetSongById,
};
