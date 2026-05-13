import React, { useState } from 'react';

const initialTasks = [
  { id: '1', title: 'Rancang Database', status: 'To Do' },
  { id: '2', title: 'Integrasi RabbitMQ', status: 'In Progress' },
  { id: '3', title: 'Setup API Gateway', status: 'Done' },
];

const Board = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      {columns.map((column) => (
        <div key={column} style={{ 
          backgroundColor: '#ebecf0', 
          borderRadius: '8px', 
          width: '300px', 
          padding: '10px',
          minHeight: '400px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#172b4d' }}>{column}</h4>
          
          {/* List Kartu Tugas */}
          {tasks
            .filter((t) => t.status === column)
            .map((task) => (
              <div key={task.id} style={{ 
                backgroundColor: 'white', 
                padding: '12px', 
                borderRadius: '4px', 
                marginBottom: '8px',
                boxShadow: '0 1px 0 rgba(9,30,66,.25)',
                cursor: 'pointer'
              }}>
                {task.title}
              </div>
            ))}
            
          <button style={{ 
            width: '100%', 
            padding: '8px', 
            border: 'none', 
            background: 'transparent', 
            textAlign: 'left',
            cursor: 'pointer',
            color: '#5e6c84'
          }}>
            + Tambah Kartu
          </button>
        </div>
      ))}
    </div>
  );
};

export default Board;