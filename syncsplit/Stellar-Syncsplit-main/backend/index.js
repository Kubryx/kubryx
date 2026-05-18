import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3005

const STATIC_ORIGINS = [
  'https://kubryx.vercel.app',
  'https://kubryx-2xclq5gjr-vsrupeshoffl-5415s-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
]
const VERCEL_PREVIEW_RE = /^https:\/\/kubryx-[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true) // server-to-server / curl
    if (STATIC_ORIGINS.includes(origin)) return cb(null, true)
    if (VERCEL_PREVIEW_RE.test(origin)) return cb(null, true)
    return cb(null, false)
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'syncsplit' })
})

app.listen(port, () => {
  console.log(`SyncSplit backend running on port ${port}`)
})
