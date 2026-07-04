import Album from '#domain/album/Album.js'

export interface AlbumRepository {
	create(album: Album): Promise<Album>,
   	delete(id: string): Promise<void>;
	findById(id: string): Promise<Album | null>,
    list(page: number, limit: number): Promise<Album[]>
    update(id: string, data: Partial<Album>, expectedCoverImageKey?: string | null): Promise<void>
}
