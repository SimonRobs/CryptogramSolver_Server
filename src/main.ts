import { exec, execFile } from 'child_process';
import { Server, Socket } from 'socket.io';
import express from 'express';
import path from 'path';
import SocketMessages from './enums/SocketMessages';
import EncryptedLetter from './models/EncryptedLetter';
import EncryptedWord from './models/EncryptedWord';
import { config } from 'dotenv';

const WORDS_FILE = 'words.txt';

config({
    path: path.resolve(__dirname, `../${process.env.NODE_ENV}.env`),
});
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 443;

const expressConfig = express().use(express.json());

if (process.env.NODE_ENV === 'production') {
    expressConfig.use(express.static(path.join(__dirname, '../bin/main.js')));
}

const server = expressConfig.listen(PORT, () =>
    console.log(`Listening on ${PORT}`)
);

const io = new Server(server, {
    cors: {
        origin: HOST,
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket: Socket) => {
    socket.on(SocketMessages.CRYPTOGRAM, (words: EncryptedWord[]) => {
        const byValue = (letter: EncryptedLetter) =>
            letter.value === '' ? '_' : letter.value;
        const byKey = (letter: EncryptedLetter) =>
            letter.key === '' ? '_' : letter.key;
        const values = words
            .map((word: EncryptedWord) => word.letters.map(byValue).join(''))
            .join(' ');
        const keys = words
            .map((word: EncryptedWord) => word.letters.map(byKey).join(''))
            .join(' ');
        const wordsFile = path.join(__dirname, `../algorithm/${WORDS_FILE}`);
        const solverProc = execFile('./algorithm/solver', [
            wordsFile,
            values,
            keys,
        ]);
        solverProc.stdout!.on('data', (data) =>
            socket.emit(SocketMessages.ANSWER, data)
        );
        solverProc.on('close', () => socket.emit(SocketMessages.DONE));
    });
});
