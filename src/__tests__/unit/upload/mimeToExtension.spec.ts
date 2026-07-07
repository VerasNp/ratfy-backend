import { mimeToExtension } from '#application/useCases/upload/mimeToExtension.js'
import { describe, expect, it } from 'vitest'

describe('mimeToExtension', () => {
  it('should return mp3 for audio/mpeg', () => {
    expect(mimeToExtension('audio/mpeg')).toBe('mp3')
  })

  it('should return ogg for audio/ogg', () => {
    expect(mimeToExtension('audio/ogg')).toBe('ogg')
  })

  it('should return wav for audio/wav', () => {
    expect(mimeToExtension('audio/wav')).toBe('wav')
  })

  it('should return flac for audio/flac', () => {
    expect(mimeToExtension('audio/flac')).toBe('flac')
  })

  it('should return aac for audio/aac', () => {
    expect(mimeToExtension('audio/aac')).toBe('aac')
  })

  it('should return m4a for audio/mp4', () => {
    expect(mimeToExtension('audio/mp4')).toBe('m4a')
  })

  it('should return jpg for image/jpeg', () => {
    expect(mimeToExtension('image/jpeg')).toBe('jpg')
  })

  it('should return png for image/png', () => {
    expect(mimeToExtension('image/png')).toBe('png')
  })

  it('should return webp for image/webp', () => {
    expect(mimeToExtension('image/webp')).toBe('webp')
  })

  it('should return gif for image/gif', () => {
    expect(mimeToExtension('image/gif')).toBe('gif')
  })

  it('should fallback to subtype for unknown MIME type', () => {
    expect(mimeToExtension('application/octet-stream')).toBe('octet-stream')
  })

  it('should fallback to default for unknown MIME type with no subtype', () => {
    expect(mimeToExtension('unknown')).toBe('bin')
  })

  it('should use custom fallback when MIME has no subtype', () => {
    expect(mimeToExtension('unknown', 'dat')).toBe('dat')
  })
})
