export type PlaylistListItemOutputDTO = {
  id:       string
  name:     string
  isPublic: boolean
  ownerId:  string
}

export type PlaylistListOutputDTO = PlaylistListItemOutputDTO[]