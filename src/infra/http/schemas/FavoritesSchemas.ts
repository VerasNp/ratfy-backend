import { z } from 'zod'

export const FavoriteAddTrackSchema = z.object({ trackId: z.string().uuid('Invalid Track ID format. Must be a valid UUID.') })
export const FavoriteAddArtistSchema = z.object({ artistId: z.string().uuid('Invalid Artist ID format. Must be a valid UUID.') })
export const FavoriteAddPlaylistSchema = z.object({ playlistId: z.string().uuid('Invalid Playlist ID format. Must be a valid UUID.') })
export const FavoriteAddAlbumSchema = z.object({ albumId: z.string().uuid('Invalid Album ID format. Must be a valid UUID.') })
export const FavoriteRemoveTrackSchema = z.object({ trackId: z.string().uuid('Invalid Track ID format. Must be a valid UUID.') })
export const FavoriteRemoveArtistSchema = z.object({ artistId: z.string().uuid('Invalid Artist ID format. Must be a valid UUID.') })
export const FavoriteRemovePlaylistSchema = z.object({ playlistId: z.string().uuid('Invalid Playlist ID format. Must be a valid UUID.') })
export const FavoriteRemoveAlbumSchema = z.object({ albumId: z.string().uuid('Invalid Album ID format. Must be a valid UUID.') })
