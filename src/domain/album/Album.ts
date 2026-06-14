import crypto from "crypto";

export type AlbumType =
	| 'album'
	| 'single'

class Album {
    public readonly albumType: AlbumType
    public readonly artistIds: string[]
	public readonly createdAt: Date
	public readonly id: string
	public isDeleted?: boolean
	public isPublic: boolean
    public readonly label: string
    public readonly name: string
	public readonly releaseDate: Date // yyyy-mm-dd <- Sort
    public totalTracks: number
  constructor(
	    id: string,
	    name: string,
	    albumType: AlbumType,
		releaseDate: Date, // yyyy-mm-dd <- Sort
	    totalTracks: number,
	    label: string,
	    artistIds: string[],
		createdAt: Date,
		isDeleted = false,
	    isPublic: boolean,
  ) {
  		if (!this.isDateValid(releaseDate)) {
		  throw new Error('Invalid Date');
    	}
  		this.id = id
		this.name = name
		this.albumType = albumType
		this.releaseDate = releaseDate
	  	this.totalTracks = albumType == 'single' ? 1 : totalTracks
		this.label = label
		this.artistIds = artistIds
		this.createdAt = createdAt
		this.isDeleted = isDeleted
	  	this.isPublic = isPublic
  	}
	public static create(
		name: string,
		albumType: AlbumType = 'album',
		releaseDate: Date,
		totalTracks: number,
		label: string,
		artistIds: string[],
		createdAt: Date,
		isDeleted: boolean,
		isPublic: boolean,
	): Album {
		const id = crypto.randomUUID();
		return new Album(
			id,
			name,
			albumType,
			releaseDate,
			totalTracks,
			label,
			artistIds,
			createdAt,
			isDeleted,
			isPublic,
		);
	}
	public static restore(
		id: string,
		name: string,
		albumType: AlbumType,
		releaseDate: Date, //
		totalTracks: number,
		label: string,
		artistIds: string[],
		createdAt: Date,
		isDeleted: boolean,
		isPublic: boolean,
	): Album {
		return new Album(
			id,
			name,
			albumType,
			releaseDate,
			totalTracks,
			label,
			artistIds,
			createdAt,
			isDeleted,
			isPublic,
		);
	}
	public getFullReleaseDate(): string {
		return this.releaseDate.toString();
	}
	public getYearReleaseDate(): string {
		return this.releaseDate.getFullYear().toString();
	}
	private isDateValid(date: Date): boolean {
		const ActualDate = new Date();
		if (date > ActualDate) {
			return false;
		}
		const oldestValidDate = new Date (1000,1,1)
		if (date < oldestValidDate) {
			return false;
		}
		return true;
	}

}
export default Album;
