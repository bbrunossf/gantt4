// app/routes/gantt.tsx
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GanttComponent } from '@syncfusion/ej2-react-gantt'
import { DataManager, WebApiAdaptor } from '@syncfusion/ej2-data'
import { prisma } from '~/utils/db.server'

import { ColumnsDirective, ColumnDirective, Inject, Selection, AddDialogFieldsDirective, AddDialogFieldDirective, RowDD } from '@syncfusion/ej2-react-gantt';
import { Edit, Toolbar, ToolbarItem } from '@syncfusion/ej2-react-gantt';
import { DayMarkers, ContextMenu, Reorder, ColumnMenu, Filter, Sort } from '@syncfusion/ej2-react-gantt';

import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from 'react';

import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-gantt/styles/material.css';
import '@syncfusion/ej2-grids/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-layouts/styles/material.css';
import '@syncfusion/ej2-lists/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-splitbuttons/styles/material.css';
import '@syncfusion/ej2-treegrid/styles/material.css';

//Notas sobre o WebApiAdaptor:
//dados hierarquicos: usa a propriedade 'child' (quando for dados remotos), e o campo ParentId é obrigatório (id: 'TaskId', e  child: 'SubTasks')
//dados planos (flat): precisa do 'id' e do 'parentID' para criar a hierarquia (id: 'TaskID', e parentID: 'ParentId'). Só esse é permitido para o Gantt
//If both child and parentID are mapped, the records will not render properly because

//Loader para SSR (pré-carregamento dos dados)
export const loader = async () => {
  console.log("Loader de dados====================================");
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { id: 'asc' }  //ordenar pelo 'showOrder'
    });
    //console.log("Tarefas encontradas na função loader:", tasks);

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
    
    //console.log("Tarefas formatadas na função loader:", formattedTasks);
    return (formattedTasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" }, 
      { status: 500 }
    );
  }
};



export default function GanttRoute() {
  const ganttRef = useRef<GanttComponent>(null);
  const fetcher = useFetcher();
  const formattedTasks = useLoaderData<typeof loader>()

  function ganttManager ()  {
    // Conecta com a fonte de dados remota após montagem
    if (ganttRef.current) {
      console.log("Gantt montado");
      ganttRef.current.dataSource = dataManager;
      console.log("Dados iniciais alterados para dataManager");
      //gantt.refresh();
    }
  }

  // Configuração do DataManager com WebApiAdaptor
  const dataManager = new DataManager({
    url: '/api/tasks',
    removeUrl: '/api/tasks/taskId',
    adaptor: new WebApiAdaptor(),
    //batchUrl: '/api/tasks/batch',
    crossDomain: true
    //updateType: 'POST'
  })

  //para exibir a resposta do componente após uma ação
  const handleActionComplete = async (args: any) => {
    console.log("ActionComplete acionada");
    if (args.data) {
      console.log("Ação completada! (request e data):", args.requestType, args.data);
    }
    if (args) {
      console.log("Ação completada!! (=================args completo=============):", args);
    }
  }

  useEffect(() => {
    ganttManager();
  }, []);

  return (
    <div style={{ margin: '20px' }}>
      <h1>Gerenciamento de Tarefas</h1>
      <h1>Gerenciamento de Tarefas</h1>
      <h1>Gerenciamento de Tarefas</h1>
      <h1>Gerenciamento de Tarefas</h1>
      <h1>Gerenciamento de Tarefas</h1>
      <GanttComponent
        id='Default' 
        dataSource={formattedTasks} //primeira fonte de dados vem do loader        
        ref={ganttRef}

        actionComplete={handleActionComplete}

        //resourceFields: define o mapa de campos para os recursos
        
        //taskFields: define o mapa de campos para as tarefas
        taskFields={{
          id: 'TaskID',
          name: 'taskName', //tem que ser name!
          startDate: 'StartDate',
          endDate: 'EndDate',
          duration: 'Duration',
          progress: 'Progress',
          parentID: 'parentId', //esse é a relação para dados flat 
          notes: 'Notes',
          //ainda não tenho coluna para o 'Resources'
          //resources: 'Resources',
          
          //resourceInfo: 'ResourceInfo',
          //child: 'subtasks', //Não se usa o child, pois os dados são planos (flat)          

          dependency: 'Predecessor' //tem que ser 'dependency'; o da direita é o nome do campo no GanttComponent
        }}       

        // timelineSettings={{
        //   timelineUnitSize: 50,
        //   topTier: {
        //     unit: 'Day',
        //     format: 'MMM dd, yyyy'
        //   },
        //   bottomTier: {
        //     unit: 'Hour',
        //     format: 'HH:mm'
        //   }
        // }}

        allowSelection={true}
        allowSorting={true} //classificar/ordenar as LINHAS ao clicar nos cabeçalhos das COLUNAS
        allowResizing={true} //redimensionar as COLUNAS
        allowReordering={true} //reordenar as COLUNAS
        allowRowDragAndDrop={true} //arrastar e soltar LINHAS
        allowTaskbarDragAndDrop={true} //arrastar e soltar TAREFAS
        enableContextMenu={true}

        //editSettings são relacionadas a alterações nas tarefas
        editSettings={{
          allowAdding: true,
          allowEditing: true,
          allowDeleting: true,
          allowTaskbarEditing: true
        }}

        toolbar={['Add', 'Edit', 'Update', 'Delete', 'Cancel', 'Indent', 'Outdent']}
        height="650px"
        >
        {/* campos a serem exibidos na caixa de diálogo de Adicionar. Se não declarar aqui, e não tiver campo para tal, não aparece.
        Se não for especificado, os campos derivam dos valores de 'taskSettings' e 'columns'*/}        
        <AddDialogFieldsDirective>
            <AddDialogFieldDirective type='General' headerText='General' ></AddDialogFieldDirective>
            <AddDialogFieldDirective type='Dependency'></AddDialogFieldDirective>
            <AddDialogFieldDirective type='Resources'></AddDialogFieldDirective> {/* ainda não tenho coluna para o 'Resources', então não aparece, mesmo colocando aqui */}
            <AddDialogFieldDirective type='Notes'></AddDialogFieldDirective>
        </AddDialogFieldsDirective>  
       
        
        <Inject services={[Selection, Edit, Toolbar, DayMarkers, ContextMenu, Reorder, ColumnMenu, Filter, Sort, RowDD]} />
      </GanttComponent>
    </div>
  )
}