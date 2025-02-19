require('dotenv').config()

module.exports = [
  {
    type: 'postgres',
    host: process.env.PG_HOST,
    username: process.env.PG_ACCOUNT,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    synchronize: process.env.PG_SYNCHRONIZE,
    logging: process.env.PG_LOGGING,
    entities: [process.env.PG_ENTITIES],
    cli: {
      entitiesDir: process.env.PG_ENTITIES_DIR,
    },
  },
]
