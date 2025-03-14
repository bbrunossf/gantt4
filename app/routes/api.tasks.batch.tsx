import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server'
import type { ActionFunction } from '@remix-run/node'

export const action: ActionFunction = async ({ request }) => {
  try {
    const changes = await request.json()

    const results = await prisma.$transaction(async (tx) => {
      return Promise.all(changes.map(async (change: any) => {
        if (change.added) {
          const addedTask = await tx.task.create({ data: change.added })
          return { added: addedTask }
        }
        if (change.updated) {
          const updatedTask = await tx.task.update({
            where: { TaskID: change.updated.TaskID },
            data: change.updated
          })
          return { updated: updatedTask }
        }
        if (change.deleted) {
          await tx.task.delete({ where: { TaskID: change.deleted.TaskID } })
          return { deleted: change.deleted.TaskID }
        }
        return null
      }))
    })

    return json(results)
  } catch (error) {
    return json(
      { error: 'Erro no processamento em lote', details: error },
      { status: 500 }
    )
  }
}