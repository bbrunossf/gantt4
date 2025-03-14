import { data, json } from '@remix-run/node'
import { prisma } from '~/utils/db.server'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'

//obs: os dados não vem em formData; vêm em JSON
//GanttComponent não usa 'action', usa 'method'
//dados vindos do WebAPIAdaptor não vêm com action, vêm com method

// GET /api/tasks
//não precisa de tratar solicitações GET, pois o Remix já faz isso
// mas o que funciona é dados os dados iniciais pelo loader
// e depois mudar a fonte de dados para o DataManager

// DELETE ainda não está funcionando
// REORDENAÇÃO DAS TAREFAS também não está funcionando (tem que ter uma função
// que reordene as tarefas de acordo com a nova ordem, usando um campo novo,
//tipo ''showOrder'', por exemplo)


//apenas para teste, só pra ver o formato dos dados recebidos
// export const action: ActionFunction = async ({ request }) => {
//   try {
//     // Verifica o método e Content-Type
//     const contentType = request.headers.get("Content-Type") || "";
//     console.log("Content-Type:", contentType);   
//     let data;
//     let action;
    
//     // Se for JSON    
//     data = await request.json();
//     action = data.action;        
    
//     console.log("Ação recebida:", action);
//     console.log("Dados recebidos:", data);        
// }
// catch (error) {
//   console.error("Erro ao executar ação:", error);
//   return json({ error: "Erro ao executar ação" }, { status: 500 });
// }
// }


export const action: ActionFunction = async ({ request, params }) => {
  try {    
    const method = request.method; // Obtém o método HTTP
    console.log("Método HTTP:", method);        
    console.log("URL:", request.url); // detalhes da requisição
    //console.log("Headers:", Object.fromEntries([...request.headers.entries()]));
    
    // Extrair os dados JSON do request (se houver)
    let requestData = {};
    if (method !== "GET" && request.headers.get("Content-Type")?.includes("application/json")) {
      requestData = await request.json();
      console.log("Dados recebidos:", requestData);
    }

    // Determina a ação com base no método HTTP e nos dados
    if (method === "POST") {
      // POST geralmente é usado para criar novos registros
      const taskData = requestData[0]; //não está correto pegar só o primeiro item
      console.log("Criando nova tarefa:", taskData);
      
      const novaTarefa = await prisma.task.create({
        data: {
          taskName: taskData.taskName,
          startDate: new Date(taskData.StartDate || taskData.startDate),
          endDate: new Date(taskData.EndDate || taskData.endDate),
          duration: taskData.Duration,
          progress: taskData.Progress || 0,
          parentId: taskData.parentId || null,
          predecessor: taskData.Predecessor || null, 
          // Adicione outros campos conforme necessário
        }
      });
      
      return json({ success: true, result: novaTarefa });
    }
    
    else if (method === "PUT") {
      // PUT geralmente é usado para atualizar registros existentes
      const taskData = requestData[0];
      const taskId = parseInt(taskData.TaskID);
      
      console.log("Atualizando tarefa:", taskId, taskData);
      
      const tarefaAtualizada = await prisma.task.update({
        where: { id: taskId },
        data: {
          taskName: taskData.taskName,
          startDate: new Date(taskData.StartDate || taskData.startDate),
          endDate: new Date(taskData.EndDate || taskData.endDate),
          duration: taskData.Duration,
          parentId: taskData.parentId || null,
          predecessor: taskData.Predecessor || null,        
          progress: taskData.Progress,                    
          // Adicione outros campos conforme necessário
        }
      });
      
      return json({ success: true, result: tarefaAtualizada });
    }
    
    else if (method === "DELETE") {
      //ele já tenta direto ir para a url com final = id da tarefa a deletar
      console.log("URL do DELETE:", request.url);

      const taskId = Number(params.taskId);
      console.log("ID da tarefa a excluir:", taskId);

      // Delete em cascata (tarefas filhas primeiro)
      await prisma.task.deleteMany({
        where: { parentId: taskId }
      });
      console.log("tarefas filhas apagadas");

      // Delete da tarefa principal
      await prisma.task.delete({
        where: { id: taskId }
      });
      console.log("tarefa principal apagada");

      // return json({ 
      //   success: true,
      //   deletedId: taskId
      // }, { status: 200 });
    
    // Resposta REQUERIDA pelo WebApiAdaptor:
    return Response.json({ 
      action: 'delete',
      key: taskId,
      keyColumn: 'taskId' // Ajuste para o nome do seu campo ID
    }, { status: 200 });
  }

  } catch (error) {
    console.error("Erro na exclusão:", error);
    return data(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
};


      // const requestData2 = requestData[0];
      // // DELETE é usado para remover registros
      // // O ID geralmente vem como parte da URL ou nos dados
      // let taskId;
      
      // // Verifica se o ID está nos dados JSON
      // if (requestData2 && (requestData2.key || requestData2.id)) {
      //   taskId = parseInt(requestData2.key || requestData2.id);
      // } 
      // else {
      //   //Tenta extrair o ID da URL
      //   const urlParts = request.url.split("/");
      //   const lastPart = urlParts[urlParts.length - 1];
      //   if (/^\d+$/.test(lastPart)) {
      //     taskId = parseInt(lastPart);
      //   }
      // }            
      // if (!taskId) {
      //   throw new Error("Não foi possível determinar o ID da tarefa para exclusão");
      // }      
      // console.log("Excluindo tarefa:", taskId);      
      // // Primeiro exclui tarefas filhas relacionadas (se houver)
      // await prisma.task.deleteMany({
      //   where: { parentId: taskId }
      // });      
      // // Depois exclui a tarefa principal
      // await prisma.task.delete({
      //   where: { id: taskId }
      // });      
      // return json({ success: true });

    //}
    
//     // Se o método não for reconhecido
//     return json({ success: false, error: `Método HTTP não suportado: ${method}` }, { status: 400 });
    
//   } catch (error) {
//     console.error("Erro ao processar requisição:", error);
//     return json(
//       { 
//         success: false, 
//         error: error instanceof Error ? error.message : "Erro desconhecido" 
//       }, 
//       { status: 500 }
//     );
//   }
// };

// Loader para carregar dados (requisições GET)
// export const loader = async () => {
  export const loader: LoaderFunction = async ({ request }) => {
  console.log("Solicitação GET no servidor=====");
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { id: 'asc' } //ordenar pelo 'showOrder'
    });
    console.log("Tarefas encontradas na função GET do servidor xxxxxx:");

    const formattedTasks = tasks.map(task => ({
      TaskID: task.id,
      taskName: task.taskName,
      StartDate: task.startDate.toISOString(),
      EndDate: task.endDate.toISOString(),
      Duration: task.duration,
      Progress: task.progress,
      parentId: task.parentId || null,
      Predecessor: task.predecessor,        
      uniqueID: task.uniqueID
    }));
    
    console.log("Tarefas formatadas no servidor ======:", formattedTasks);
    return Response.json(formattedTasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return data(
      { error: error instanceof Error ? error.message : "Erro desconhecido" }, 
      { status: 500 }
    );
  }
};