import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import sharp from 'sharp'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024
const MAX_FILES_PER_REQUEST = 12
const PRODUCTS_BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET || 'product-images'
const MAX_IMAGE_WIDTH = 1920
const MAX_IMAGE_HEIGHT = 1920

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
}

async function isCurrentUserAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, status: 401 as const }
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || roleData?.role !== 'admin') {
    return { ok: false, status: 403 as const }
  }

  return { ok: true as const }
}

function getAdminStorageClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function optimizeImage(file: File): Promise<{ bytes: Buffer; contentType: string; extension: string }> {
  const inputBytes = Buffer.from(await file.arrayBuffer())

  if (file.type === 'image/gif') {
    return { bytes: inputBytes, contentType: file.type, extension: '.gif' }
  }

  const image = sharp(inputBytes).rotate().resize({
    width: MAX_IMAGE_WIDTH,
    height: MAX_IMAGE_HEIGHT,
    fit: 'inside',
    withoutEnlargement: true,
  })

  if (file.type === 'image/jpeg') {
    return {
      bytes: await image.jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
      contentType: 'image/jpeg',
      extension: '.jpg',
    }
  }

  if (file.type === 'image/png') {
    return {
      bytes: await image.png({ compressionLevel: 9, palette: true, quality: 82 }).toBuffer(),
      contentType: 'image/png',
      extension: '.png',
    }
  }

  if (file.type === 'image/webp') {
    return {
      bytes: await image.webp({ quality: 82 }).toBuffer(),
      contentType: 'image/webp',
      extension: '.webp',
    }
  }

  if (file.type === 'image/avif') {
    return {
      bytes: await image.avif({ quality: 55 }).toBuffer(),
      contentType: 'image/avif',
      extension: '.avif',
    }
  }

  return {
    bytes: inputBytes,
    contentType: file.type,
    extension: MIME_EXTENSION_MAP[file.type],
  }
}

async function ensureProductsBucket() {
  const supabaseAdmin = getAdminStorageClient()
  const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

  if (bucketsError) {
    throw new Error('No se pudieron listar los buckets de almacenamiento')
  }

  const exists = (buckets || []).some((bucket) => bucket.name === PRODUCTS_BUCKET)
  if (exists) {
    return supabaseAdmin
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(PRODUCTS_BUCKET, {
    public: true,
    fileSizeLimit: `${MAX_FILE_SIZE_BYTES}`,
    allowedMimeTypes: Object.keys(MIME_EXTENSION_MAP),
  })

  if (createError) {
    throw new Error('No se pudo crear el bucket de imágenes de productos')
  }

  return supabaseAdmin
}

function getObjectPathFromPublicUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url)
    const prefix = `/storage/v1/object/public/${PRODUCTS_BUCKET}/`

    if (!parsedUrl.pathname.startsWith(prefix)) {
      return null
    }

    const objectPath = decodeURIComponent(parsedUrl.pathname.slice(prefix.length))
    return objectPath.length > 0 ? objectPath : null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const auth = await isCurrentUserAdmin()

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'No autenticado' : 'No autorizado' },
        { status: auth.status }
      )
    }

    const formData = await request.formData()
    const incomingFiles = formData.getAll('files')
    const files = incomingFiles.filter((value): value is File => value instanceof File)

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se recibieron archivos' }, { status: 400 })
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Solo puedes subir hasta ${MAX_FILES_PER_REQUEST} archivos por solicitud` },
        { status: 400 }
      )
    }

    const supabaseAdmin = await ensureProductsBucket()

    const urls: string[] = []

    for (const file of files) {
      const extension = MIME_EXTENSION_MAP[file.type]

      if (!extension) {
        return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG, WEBP, GIF o AVIF' }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Cada imagen debe pesar como máximo ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB` },
          { status: 400 }
        )
      }

      const optimized = await optimizeImage(file)
      const fileName = `${Date.now()}-${randomUUID()}${optimized.extension || extension}`
      const objectPath = `products/${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from(PRODUCTS_BUCKET)
        .upload(objectPath, optimized.bytes, {
          contentType: optimized.contentType,
          upsert: false,
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        return NextResponse.json({ error: 'No se pudo subir una de las imágenes' }, { status: 500 })
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from(PRODUCTS_BUCKET).getPublicUrl(objectPath)

      urls.push(publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('POST /api/admin/products/upload exception:', error)
    return NextResponse.json({ error: 'No se pudieron subir las imágenes' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await isCurrentUserAdmin()

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'No autenticado' : 'No autorizado' },
        { status: auth.status }
      )
    }

    const body = await request.json().catch(() => null)
    const url = typeof body?.url === 'string' ? body.url.trim() : ''

    if (!url) {
      return NextResponse.json({ error: 'URL de imagen inválida' }, { status: 400 })
    }

    const objectPath = getObjectPathFromPublicUrl(url)

    if (!objectPath) {
      return NextResponse.json(
        { error: 'La imagen no pertenece al bucket de productos configurado' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getAdminStorageClient()
    const { error } = await supabaseAdmin.storage.from(PRODUCTS_BUCKET).remove([objectPath])

    if (error) {
      console.error('Supabase remove error:', error)
      return NextResponse.json({ error: 'No se pudo borrar la imagen del almacenamiento' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/products/upload exception:', error)
    return NextResponse.json({ error: 'No se pudo borrar la imagen' }, { status: 500 })
  }
}
