/* eslint-disable camelcase */
const mapSongsDBToModel = ({id, title, year, performer, genre, duration, album_id}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapAlbumDBToModel = ({id, name, year, cover_url}) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
});

module.exports = {mapSongsDBToModel, mapAlbumDBToModel};

