// precisa vir antes dos demais imports: eles leem process.env ainda na carga do módulo
import 'dotenv/config';

import app from './app.js';
import { testarConexao } from './config/database.js';

const porta = Number(process.env.PORT) || 3000;

try {
  await testarConexao();
} catch (erro) {
  console.error(`Falha ao conectar no banco ${process.env.DB_NAME}: ${erro.message}`);
  process.exit(1);
}

app.listen(porta, () => {
  console.log(`Servidor ouvindo em http://localhost:${porta}`);
});
