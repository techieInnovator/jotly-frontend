import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const DATA_DIR = path.join(process.cwd(), 'src', 'data')
const FILE_PATH = path.join(DATA_DIR, 'waitlist.json')

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '[]', { encoding: 'utf8' })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email } = body || {}
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    ensureDataFile()
    const raw = fs.readFileSync(FILE_PATH, { encoding: 'utf8' })
    let entries = [] as Array<{ name?: string; email: string; addedAt: string }>
    try { entries = JSON.parse(raw) } catch (e) { entries = [] }

    const normalizedEmail = email.trim().toLowerCase()
    const exists = entries.find(e => e.email === normalizedEmail)
    if (exists) {
      return NextResponse.json({ message: 'You are already on the list' }, { status: 200 })
    }

    const record = { name: name ? String(name).trim() : '', email: normalizedEmail, addedAt: new Date().toISOString() }
    entries.push(record)
    fs.writeFileSync(FILE_PATH, JSON.stringify(entries, null, 2), { encoding: 'utf8' })

    return NextResponse.json({ message: 'Added to waitlist', entry: record })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
