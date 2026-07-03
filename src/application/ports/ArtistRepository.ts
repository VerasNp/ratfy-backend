import type { TransactionHandle } from '#application/ports/TransactionHandle.js'
import Artist from '#domain/artist/Artist.js'

export interface ArtistRepository {
    /**
     * Creates a new Artist to the database.
     * @param artist - The Artist domain entity to be created.
     * @param tx - Optional transaction handle for scoping the operation within a unit of work.
     * @returns A promise that resolves to the created Artist.
     */
    create(artist: Artist, tx?: TransactionHandle): Promise<Artist>

    /**
     * Deletes an Artist from the database by their ID.
     * @param id - The unique identifier of the Artist to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    delete(id: string): Promise<void>

    /**
     * Finds an Artist by their unique ID.
     * @param id - The unique identifier of the Artist.
     * @returns A promise that resolves to the Artist if found, or null otherwise.
     */
    findById(id: string): Promise<Artist | null>

    /**
     * Finds an Artist by their associated User ID.
     * This is useful since an Artist is an extension of a User.
     * @param userId - The unique identifier of the User.
     * @returns A promise that resolves to the Artist if found, or null otherwise.
     */
    findByUserId(userId: string): Promise<Artist | null>

    /**
     * Finds Artists by their IDs.
     * @param ids - The unique identifiers of the Artists.
     * @returns A promise that resolves to an array of Artists.
     */
    listByIds(ids: string[]): Promise<Artist[]>

    /**
     * Retrieves a paginated list of Artists.
     * @param page - The page number to retrieve (1-indexed).
     * @param limit - The maximum number of Artists to return per page.
     * @returns A promise that resolves to an array of Artists.
     */
    list(page: number, limit: number): Promise<Artist[]>

    /**
     * Updates an existing Artist's information.
     * @param id - The unique identifier of the Artist to update.
     * @param data - The partial data to update the Artist with.
     * @returns A promise that resolves when the update is complete.
     */
    update(id: string, data: Partial<Artist>): Promise<void>
}