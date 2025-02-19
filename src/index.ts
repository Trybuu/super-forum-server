import express from 'express'
import session from 'express-session'
import connectRedis from 'connect-redis'
import Redis from 'ioredis'
import { DataSource } from 'typeorm'
import { User } from './repo/User'

require('dotenv').config()

console.log(`Current environment is set to: ${process.env.NODE_ENV}`)

// Rozszerzenie typu dla sesji
declare module 'express-session' {
  interface Session {
    userid: any
    loadedCount: number
  }
}

// Skonfiguruj DataSource
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 5432, // Domyślny port dla PostgreSQL to 5432
  username: process.env.PG_ACCOUNT,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [User],
  synchronize: true, // Tylko w przypadku deweloperskim, w produkcji używaj migracji
  logging: process.env.NODE_ENV !== 'production',
})

const main = async () => {
  const app = express()
  const router = express.Router()

  // Inicjalizacja połączenia z bazą danych
  try {
    await dataSource.initialize()
    console.log('Połączenie z bazą danych nawiązane!')
  } catch (error) {
    console.error('Błąd podczas nawiązywania połączenia z bazą danych:', error)
    return
  }

  // Połączenie z Redis
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

  // Ustawienie session store w Redis
  const RedisStore = connectRedis(session)
  const redisStore = new RedisStore({
    client: redis,
  })

  // Konfiguracja sesji
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
}

main()
