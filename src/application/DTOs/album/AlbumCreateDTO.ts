import { z } from 'zod'

const AlbumTypeSchema = z.enum(['album', 'single'])

import {
	CopyrightSchema,
	ImageSchema,
} from '../SharedSchema'

const releaseDateRefinement = (releaseDate: string) => {
  const patterns: Record<string, RegExp> = {
    'default':   /^\d{2}-\d{2}-\d{4}$/,
  }
  return patterns['default']?.test(releaseDate) ?? false
}


export const AlbumCreateSchema = z.object({
  albumType:        AlbumTypeSchema,
  artistIds:        z.array(z.string().uuid()).min(1),
  copyrights:       z.array(CopyrightSchema).default([]),
  genres:           z.array(z.string()).default([]),
  images:           z.array(ImageSchema).default([]),
  label:            z.string().min(1).max(255),
  name:             z.string().min(1).max(500),
  popularity:       z.number().int().min(0).max(100).default(0),
  releaseDate:      z.string(),
  totalTracks:      z.number().int().min(1),
  // MongoDB metadata — optional at creation
}).refine(releaseDateRefinement, {
  message: 'releaseDate format must match releasePrecision (year: YYYY, month: YYYY-MM, day: YYYY-MM-DD)',
  path: ['releaseDate'],
})
export type CreateAlbumDTO = z.infer<typeof AlbumCreateSchema>
