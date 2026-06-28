export async function compressImage(
  file: File,
  options: {
    quality?: number
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<File> {
  try {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('quality', (options.quality ?? 80).toString())
    formData.append('maxWidth', (options.maxWidth ?? 1200).toString())
    formData.append('maxHeight', (options.maxHeight ?? 1200).toString())

    const response = await fetch('/api/compress-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      console.warn('Compression failed, using original file')
      return file
    }

    const blob = await response.blob()
    const originalSize = parseInt(response.headers.get('X-Original-Size') ?? '0')
    const compressedSize = parseInt(response.headers.get('X-Compressed-Size') ?? '0')
    const ratio = response.headers.get('X-Compression-Ratio') ?? '0%'

    console.log(`Image compressed: ${(originalSize/1024).toFixed(0)}KB → ${(compressedSize/1024).toFixed(0)}KB (${ratio} saved)`)

    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
    return new File([blob], fileName, { type: 'image/webp' })
  } catch (error) {
    console.warn('Compression error, using original:', error)
    return file
  }
}