
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { routerUsuario } from './rotas/rotas_usuario.js';
import { conectarAoBanco } from './banco.js';
import configurarChat from './controller/chatcontroller.js';
import { routerMensagem } from './rotas/chat.js';
config();
const porta = process.env.PORTA;

conectarAoBanco()

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routerUsuario);
app.use('/api/mensagens', routerMensagem);



const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

configurarChat(io);


server.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
