import express from 'express';
import {buscarMensagensAnteriores} from '../controller/mensagemController.js';

export const routerMensagem = express.Router();

routerMensagem.get('/anteriores/:sala', buscarMensagensAnteriores);


