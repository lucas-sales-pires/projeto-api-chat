import express from 'express';
import { buscarMensagensAnteriores } from '../controller/mensagemController.js';

export const routerMensagem = express.Router();

routerMensagem.get('/anteriores/:sala', buscarMensagensAnteriores);


routerMensagem.get('/listaSocket', (req, res) => {
  const usuarios = Object.values(socketsUsuarios).map(info => info.nome);
  res.json(usuarios);
});

