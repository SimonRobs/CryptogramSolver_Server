import { exec, execFile } from 'child_process';
import { Server, Socket } from 'socket.io';
import express from 'express';
import cors from "cors";
import path from "path";
import SocketMessages from './enums/SocketMessages';
import EncryptedLetter from './models/EncryptedLetter';
import EncryptedWord from './models/EncryptedWord';

const CRYPTOGRAM_FILE = 'cryptogram.txt';

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()

.use(cors())
.use(express.static(path.join(__dirname, "../bin/main.js")))
.use(express.json())
.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
})
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = new Server(server);

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
        const c = execFile('./algorithm/solver', [`${CRYPTOGRAM_FILE}`]);

c.stdout!.on('data', (data)=>

  socket.emit(SocketMessages.ANSWER, data)
)
      })
    });
});

