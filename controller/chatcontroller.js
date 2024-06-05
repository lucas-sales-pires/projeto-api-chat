import { Router } from 'express';
import { conectarAoBanco } from '../banco.js';
import { criarMensagem } from '../controller/mensagemController.js';


const router = Router();

export default function configurarChat(io) {
    const salas = {};
    io.on('connection', async (socket) => {
        console.log('Usuário conectado:', socket.id);
    
        socket.on('entrarNaSala', async (dados) => {
            const { sala, nome } = dados; 
            socket.join(sala);
          
            if (!salas[sala]) {
              salas[sala] = [];
            }
            salas[sala].push({ socketId: socket.id, nome });
            console.log('Usuários na sala:', salas[sala]);
    
            const client = await conectarAoBanco();
            const db = client.db('chat');
            const collection = db.collection('mensagens');
            const mensagensAnteriores = await collection.find({ sala: sala }).toArray(); 
    


            if (mensagensAnteriores.length === 0) {
                console.log('Nenhuma mensagem anterior encontrada na sala:', sala.sala);
            } else {
                socket.emit('mensagensAnteriores', mensagensAnteriores);
            }
        });

 
    
        socket.on('novaMensagem', async (mensagem) => {
            try {
              const mensagemSalva = await criarMensagem(mensagem);  
                
                io.to(mensagem.sala).emit('novaMensagem', mensagemSalva);

            } catch (err) {
              console.error('Erro ao criar e emitir mensagem:', err);
                socket.emit('erro', 'Erro ao criar mensagem');
            }
        }
        );
            
          
    
        socket.on('disconnect', () => {
            console.log('Usuário desconectado:', socket.id);
        });
    });
}
