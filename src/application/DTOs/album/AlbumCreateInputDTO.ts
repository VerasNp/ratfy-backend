import { z } from 'zod'

import { CopyrightSchema, ImageSchema } from '../SharedSchema'

const AlbumTypeSchema        = z.enum(['album', 'single'])
const ReleasePrecisionSchema = z.enum(['day', 'month', 'year'])

const RELEASE_PATTERNS: Record<string, RegExp> = {
  day:   /^\d{4}-\d{2}-\d{2}$/,  	// yyyy-mm-dd
  month: /^\d{4}-\d{2}$/,         	// yyyy-mm
  year:  /^\d{4}$/,               	// yyyy
}

export const AlbumCreateSchema = z
  .object({
    albumType:        AlbumTypeSchema,
    artistIds:        z.array(z.string().uuid()).min(1, 'At least one artist is required'),
    copyrights:       z.array(CopyrightSchema).default([]),
    genres:           z.array(z.string()).default([]),
    images:           z.array(ImageSchema).default([]),
    isPublic:         z.boolean().default(true),
    label:            z.string().min(1).max(255),
    name:             z.string().min(1).max(500),
    popularity:       z.number().int().min(0).max(100).default(0),
    releaseDate:      z.string(),
    releasePrecision: ReleasePrecisionSchema,
    totalTracks:      z.number().int().min(1),
  })
  .refine(
    ({ releaseDate, releasePrecision }) =>
      RELEASE_PATTERNS[releasePrecision]?.test(releaseDate) ?? false,
    ({ releasePrecision }) => ({
      message: `releaseDate must match precision "${releasePrecision}": ` +
               `day → YYYY-MM-DD | month → YYYY-MM | year → YYYY`,
      path: ['releaseDate'],
    })
  )

export type AlbumCreateInputDTO = z.infer<typeof AlbumCreateSchema>
