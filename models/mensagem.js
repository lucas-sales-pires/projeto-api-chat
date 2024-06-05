import mongoose from 'mongoose';

const Mensagem = new mongoose.Schema({
    conteudo: { type: String, required: true }, 
    remetenteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, 
    destinatarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    sala: { type: String }, 
    username: { type: String, required: true },
    timestamp: { type: Date, default: Date.now } 
});






export default mongoose.model('Mensagem', Mensagem);


