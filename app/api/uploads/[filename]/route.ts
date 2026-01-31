import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params

    if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // Security: Prevent directory traversal
    const safeFilename = path.basename(filename)
    const filePath = path.join(process.cwd(), 'uploads', safeFilename)

    if (!existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    try {
        const fileBuffer = await readFile(filePath)

        // Determine content type extension
        const ext = path.extname(safeFilename).toLowerCase()
        let contentType = 'application/octet-stream'

        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
        else if (ext === '.png') contentType = 'image/png'
        else if (ext === '.gif') contentType = 'image/gif'
        else if (ext === '.webp') contentType = 'image/webp'
        else if (ext === '.svg') contentType = 'image/svg+xml'

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        })
    } catch (error) {
        console.error('Error serving file:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
