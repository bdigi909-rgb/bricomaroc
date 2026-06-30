import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File
    const quality = parseInt(formData.get('quality') as string) || 80
    const maxWidth = parseInt(formData.get('maxWidth') as string) || 1200
    const maxHeight = parseInt(formData.get('maxHeight') as string) || 1200

    if (!file) {
      return NextResponse.json({ error: 'Aucune image fournie' }, { status: 400 })
    }

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Fichier non valide' }, { status: 400 })
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image trop grande (max 10MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Compresser avec Sharp
    const compressed = await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer()

    const originalSize = file.size
    const compressedSize = compressed.length
    const ratio = Math.round((1 - compressedSize / originalSize) * 100)

  return new NextResponse(compressed as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'X-Original-Size': originalSize.toString(),
        'X-Compressed-Size': compressedSize.toString(),
        'X-Compression-Ratio': `${ratio}%`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
