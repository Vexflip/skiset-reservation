import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file received' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${uuidv4()}${path.extname(file.name)}`
        const uploadDir = path.join(process.cwd(), 'public/uploads')

        try {
            await writeFile(path.join(uploadDir, filename), buffer)
        } catch (error) {
            console.error('Error writing file:', error)
            // Fallback or detailed error? 
            // Assuming directory exists (we created it).
            return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
        }

        const fileUrl = `/uploads/${filename}`

        return NextResponse.json({ url: fileUrl }, { status: 201 })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
