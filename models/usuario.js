import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Por favor, insira um e-mail válido'],
  },
  senha: { type: String, required: true },
});

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next(); 

  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
