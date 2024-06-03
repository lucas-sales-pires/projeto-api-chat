import express from 'express';
import { criarUsuario, listarUsuarios, obterUsuario, atualizarUsuario, deletarUsuario ,login} from '../controller/usuariosController.js';

export const routerUsuario = express.Router();

routerUsuario.post('/usuarios', criarUsuario);
routerUsuario.get('/usuarios', listarUsuarios);
routerUsuario.get('/usuarios/:id', obterUsuario);
routerUsuario.put('/usuarios/:id', atualizarUsuario);
routerUsuario.delete('/usuarios/:id', deletarUsuario);
routerUsuario.post('/usuarios/login', login);


