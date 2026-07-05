import z from 'zod'

export const AddFavoriteTrackSchema = z.object({ trackId: z.string().uuid() })
export const AddFavoriteArtistSchema = z.object({ artistId: z.string().uuid() })
export const AddFavoritePlaylistSchema = z.object({ playlistId: z.string().uuid() })
export const AddFavoriteAlbumSchema = z.object({ albumId: z.string().uuid() })
export const RemoveFavoriteTrackSchema = z.object({ trackId: z.string().uuid() })
export const RemoveFavoriteArtistSchema = z.object({ artistId: z.string().uuid() })
export const RemoveFavoritePlaylistSchema = z.object({ playlistId: z.string().uuid() })
export const RemoveFavoriteAlbumSchema = z.object({ albumId: z.string().uuid() })
