import { readlineClient } from "../config/config.readline.js";

async function askQuestion(query) {
    return await new Promise((resolve) => {
        readlineClient.question(query, (answer) => resolve(answer));
    });
}

export { askQuestion }