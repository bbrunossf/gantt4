// app/utils/db.server.ts
import { PrismaClient } from '@prisma/client'

// let prisma: PrismaClient

// declare global {
//   var __db__: PrismaClient
// }

// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient()
// } else {
//   if (!global.__db__) {
//     global.__db__ = new PrismaClient()
//   }
//   prisma = global.__db__
//   prisma.$connect()
// }

// export { prisma }

let prisma: PrismaClient
declare global {
  var __db: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
  prisma.$connect()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
  });
    global.__db.$connect()
  }
  prisma = global.__db
}

export { prisma }