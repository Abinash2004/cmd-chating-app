import readline from "node:readline";

const readlineClient = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout
});

export {
    readlineClient
};