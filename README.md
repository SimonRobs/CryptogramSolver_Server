# CryptogramSolver Server

Server for the [CryptogramSolver](https://github.com/SimonRobs/CryptogramSolver_Client) application.  
The algorithm is obtainable [here](https://github.com/SimonRobs/CryptogramSolver_Algorithm).

## Usage

1. Clone this repository
2. Find the local IP address of your machine and set it to the `HOST` variable in [`development.env`](./development.env)
3. On a terminal, run
    ```
    yarn install
    yarn dev
    ```
4. You should see the following string
    ```
    yarn run v1.22.18
    $ export NODE_ENV=development && ts-node ./src/main.ts
    Listening on 4444
    ```
