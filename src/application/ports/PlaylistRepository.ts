import Playlist from '#domain/playlist/Playlist.js'

export interface PlaylistRepository {
    /**
     * Creates a new Playlist in the database.
     * @param playlist - The Playlist domain entity to be created.
     * @returns A promise that resolves to the created Playlist.
     */
    create(playlist: Playlist): Promise<Playlist>

    /**
     * Deletes a Playlist from the database by its ID.
     * @param id - The unique identifier of the Playlist to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    delete(id: string): Promise<void>

    /**
     * Finds a Playlist by its unique ID.
     * @param id - The unique identifier of the Playlist.
     * @returns A promise that resolves to the Playlist if found, or null otherwise.
     */
    findById(id: string): Promise<Playlist | null>

    /**
     * Finds Playlists by their IDs.
     * @param ids - The unique identifiers of the Playlists.
     * @returns A promise that resolves to an array of Playlists.
     */
    listByIds(ids: string[]): Promise<Playlist[]>

    /**
     * Retrieves a paginated list of Playlists owned by a specific User.
     * @param ownerId - The unique identifier of the User who owns the playlists.
     * @param page - The page number to retrieve (1-indexed).
     * @param limit - The maximum number of Playlists to return per page.
     * @returns A promise that resolves to an array of Playlists.
     */
    listByOwnerId(ownerId: string, page: number, limit: number): Promise<Playlist[]>

    /**
     * Retrieves a paginated list of all Playlists.
     * @param page - The page number to retrieve (1-indexed).
     * @param limit - The maximum number of Playlists to return per page.
     * @returns A promise that resolves to an array of Playlists.
     */
    list(page: number, limit: number): Promise<Playlist[]>

    /**
     * Updates an existing Playlist's information.
     * @param id - The unique identifier of the Playlist to update.
     * @param data - The partial data to update the Playlist with.
     * @returns A promise that resolves when the update is complete.
     */
    update(id: string, data: Partial<Playlist>, expectedCoverImageKey?: string | null): Promise<void>

    /**
     * Adds a track to an existing playlist.
     * @param playlistId - The ID of the playlist.
     * @param trackId - The ID of the track to be added.
     */
    addTrack(playlistId: string, trackId: string): Promise<void>

    /**
     * Removes a track from a playlist.
     * @param playlistId - The ID of the playlist.
     * @param trackId - The ID of the track to be removed.
     */
    removeTrack(playlistId: string, trackId: string): Promise<void>
}