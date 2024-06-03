import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config();


const uri = process.env.MONGODB_URI;
const usuario = process.env.MONGODB_USUARIO;
const senha = process.env.MONGODB_SENHA;

const client = new MongoClient(uri, { auth: { username: usuario, password: senha } });

export async function conectarAoBanco() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    return client; 
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    throw err; 
  }
}

