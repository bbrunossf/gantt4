//AJUSTAR A FUNÇÃO LOADER! TIRAR AS DEPENDENCIES?

import { json } from '@remix-run/node'
import { prisma } from '~/utils/db.server'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'

// GET /api/tasks
export const loader: LoaderFunction = async ({ request }) => {
  //console.log("Loader GET?", request);
  const tasks = await prisma.task.findMany({
    include: {
      dependencies: {
        include: {
          predecessor: true
        }
      },
      predecessorDependencies: {
        include: {
          task: true
        }
      }
    }
  });

  const transformedTasks = tasks.map(task => ({
    ...task,
    dependencies: task.dependencies.map(d => ({
      PredecessorID: d.predecessorId,
      DependencyType: d.type
    }))
  }));

  console.log("teste", transformedTasks, transformedTasks.length );
  return json({ result: transformedTasks, count: transformedTasks.length });
  
  //return json({ initialDataxx: transformedTasks });
};

// POST/PUT/DELETE /api/tasks
export const action: ActionFunction = async ({ request }) => {
  //console.log("Ação GET?", request);
  try {
    const method = request.method
    console.log("Método:", method);    
    //const formData = await request.formData();    
    //console.log("FormData:", formData);
    //const method = formData.get("action");
    const url = new URL(request.url)
    console.log("URL:", url);
    //const data2 = JSON.parse(formData.get("data"));
    //console.log("Data:", data2);
    const data = await request.json()
    console.log("Data para ser usado===============:", data);
    const data2 = data[0]; //AGORA FUNCIONA!

    // DELETE
    if (method === 'DELETE') {
      const key = url.searchParams.get('key')
      if (!key) return json({ error: 'Chave inválida' }, 400)

      await prisma.task.delete({
        where: { id: parseInt(key) }
      })
      return json({ success: true }, 200)
    }

    

    // POST - Create
if (method === 'POST') {
  console.log("Chamada POST!");
  //const data = await request.json();
  

  try {
   
    const newTask = await prisma.task.create({
      data: {
        id: parseInt(data2.TaskID),
        taskName: data2.taskName,
        startDate: new Date(data2.StartDate),
        endDate: new Date(data2.EndDate),
        duration: data2.Duration,
        progress: data2.Progress,
        parentId: data2.parentId || null,
      }
    });
    console.log(newTask);

    return json(newTask, { status: 201 }); // Retorna a nova tarefa criada
  } catch (error) {
    console.error("Erro ao criar tarefa:", error); // Log do erro
    return json({ error: "Failed to create task" }, { status: 500 });
  }
}

    // PUT - Update //ESSE AINDA NAO FUNCIONA
    if (method === 'PUT') {
      const updatedTask = await prisma.$transaction(async (tx) => {
        const task = await tx.task.update({
          where: { id: data2.TaskID },
          data: {
            taskName: data2.taskName,
            startDate: new Date(data2.StartDate),
            endDate: new Date(data2.EndDate),
            duration: data2.Duration,
            progress: data2.Progress,
            parentId: data2.parentId || null
          }
        })

        await tx.taskDependency.deleteMany({
          where: { taskId: task.id }
        })

        // if (data.Predecessor) {
        //   await handleDependencies(tx, task.id, data.Predecessor)
        // }

        return task
      })

      return json(updatedTask, 200)
    }

    return json({ error: 'Método não permitido' }, 405)
  } catch (error) {
    return json({ error: 'Erro interno no servidor' }, 500)
    //return ( error )
  }
}

// Helper para tratar dependências
// async function handleDependencies(prisma: any, taskId: number, predecessors: string) {
//   const dependencies = predecessors.split(',').map(dep => {
//     const [predecessorId, type] = dep.split('-')
//     return {
//       taskId,
//       predecessorId: parseInt(predecessorId),
//       type
//     }
//   });

//   await prisma.taskDependency.createMany({
//     data: dependencies
//   });
// }