import express from 'express'
import session from 'express-session'
import connectRedis from 'connect-redis'
import Redis from 'ioredis'

require('dotenv').config()

console.log(`Current environment is set to: ${process.env.NODE_ENV}`)

const app = express()
const router = express.Router()

const redis = new Redis({
  port: Number(process.env.REDIS_PORT),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
})

redis.on('connect', () => {
  console.log('Connected to Redis')
})

redis.on('error', (err) => {
  console.error('Redis error:', err)
})

const RedisStore = connectRedis(session)
const redisStore = new RedisStore({
  client: redis,
})

declare module 'express-session' {
  interface Session {
    userid: any
    loadedCount: number
  }
}

app.use(
  session({
    store: redisStore, // Tutaj przekazujemy instancję RedisStore
    name: process.env.COOKIE_NAME || 'session',
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: '/',
      httpOnly: true,
      secure: false, // Jeśli korzystasz z HTTPS, ustaw na true
      maxAge: 1000 * 60 * 60 * 24, // 1 dzień
    },
  }),
)

app.use(router)
router.get('/', (req, res) => {
  if (!req.session.userid) {
    req.session.userid = req.query.userid
    console.log('Określono userid!')
    req.session.loadedCount = 0
  } else {
    req.session.loadedCount = (req.session.loadedCount || 0) + 1
  }

  res.send(
    `userid: ${req.session.userid}, loadedCount: ${req.session.loadedCount}`,
  )
})

const port = process.env.SERVER_PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
