import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3005

app.use(cors({
  origin: ['https://kubryx.vercel.app', 'http://localhost:3000']
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'syncsplit' })
})

app.listen(port, () => {
  console.log(`SyncSplit backend running on port ${port}`)
})
