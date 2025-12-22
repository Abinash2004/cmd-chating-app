import amqp from "amqplib";
import { log, error } from "./chalk.js";

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();
        console.log(`${log("log")}: rabbitMQ connected successfully.`);
        return channel;
    } catch (err) {
        console.error(`${error("error")}: ${err.message}`);
    }
}

async function sendToQueue(queue, message) {
    try {
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    } catch (err) {
        console.error(`${error("error")}: ${err.message}`);
    }
}

async function sendDelayed(queue, message, delayMs) {
    const delayQueue = `${queue}_delay_${delayMs}`;

    await channel.assertExchange("dlx", "direct", { durable: true });

    await channel.assertQueue(delayQueue, {
        durable: true,
        arguments: {
            "x-message-ttl": delayMs,
            "x-dead-letter-exchange": "dlx",
            "x-dead-letter-routing-key": queue
        }
    });

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, "dlx", queue);

    channel.sendToQueue(
        delayQueue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
    );
}

async function consumeQueue(queue, callback) {
    try {
        await channel.assertQueue(queue, { durable: true });
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                callback(message);
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error(`${error("error")}: ${err.message}`);
    }
}

async function joinChatRoom(userQueue) {
    const exchange = "chat_room";
    await channel.assertExchange(exchange, "fanout", { durable: true });
    await channel.assertQueue(userQueue, { durable: true });
    await channel.bindQueue(userQueue, exchange, "");
    return { exchange, userQueue };
}

async function sendToChatRoom(message) {
    const exchange = "chat_room";
    await channel.assertExchange(exchange, "fanout", { durable: true });
    channel.publish(exchange, "", Buffer.from(JSON.stringify(message)));
}

async function consumeChatQueue(userQueue, callback) {
    await channel.assertQueue(userQueue, { durable: true });
    channel.consume(userQueue, (msg) => {
        if (msg) {
            const data = JSON.parse(msg.content.toString());
            callback(data);
            channel.ack(msg);
        }
    });
}

export {
    connectRabbitMQ,
    sendToQueue,
    sendDelayed,
    consumeQueue,
    joinChatRoom,
    sendToChatRoom,
    consumeChatQueue
};