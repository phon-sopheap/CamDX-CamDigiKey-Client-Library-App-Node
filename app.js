const express  = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  return next(err)
})

app.use('/', require('./routers/camdigikey-router'))

app.listen(8000, () => {
  console.log(`Using Node.js ${process.version}`)
  console.log('Server is running on 8000...')
})
