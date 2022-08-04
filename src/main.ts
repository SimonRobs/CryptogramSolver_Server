import { exec, execFile } from 'child_process';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { APP_URL, PORT } from './constants';
import SocketMessages from './enums/SocketMessages';
import EncryptedLetter from './models/EncryptedLetter';
import EncryptedWord from './models/EncryptedWord';

const CRYPTOGRAM_FILE = 'cryptogram.txt';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
                        origin: `${APP_URL}:4200`,
    },
});

io.on('connection', (socket: Socket) => {
    socket.on(SocketMessages.CRYPTOGRAM, (words: EncryptedWord[]) => {
      
    const byValue = (letter:EncryptedLetter)=>letter.value === '' ? '_':letter.value;
    const byKey = (letter:EncryptedLetter)=>letter.key === '' ? '_':letter.key;
    const values = words.map((word:EncryptedWord)=>word.letters.map(byValue).join('')).join(' ');
    const keys = words.map((word:EncryptedWord)=>word.letters.map(byKey).join('')).join(' ');
    const cryptogram = `${values}\n${keys}`;

    const child = exec(`echo "${cryptogram}" > ${CRYPTOGRAM_FILE}`, (error, stdout, stderr) => {
        if (error) {
          throw error;
        }
      });

      child.on('exit', ()=> {
        const c = execFile('./../CryptogramSolver', ['../words.txt', `${CRYPTOGRAM_FILE}`]);

c.stdout!.on('data', (data)=>

  socket.emit(SocketMessages.ANSWER, data)
)
      })
    });
});

httpServer.listen(PORT);
