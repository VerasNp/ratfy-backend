export type AlbumListItemOutputDTO = {
  albumType:        string
  artistIds:        string[]
  id:               string
  label:            string
  name:             string
  releaseDate:      string
  releasePrecision: string
  totalTracks:      number
}

export type AlbumListOutputDTO = AlbumListItemOutputDTO[]
