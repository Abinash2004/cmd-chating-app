import amqp from "amqplib";

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect("amqp://localhost:5672");
        channel = await connection.createChannel();
        console.log("log: rabbitMQ connected successfully.");
        return channel;
    } catch (err) {
        console.error(`error: ${err.message}`);
    }
}

async function sendToQueue(queue, message) {
    try {
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    } catch (err) {
        console.error(`error: ${err.message}`);
    }
}

async function consumeQueue(queue, callback) {
    try{
        await channel.assertQueue(queue, { durable: true });
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                callback(message);
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error(`error: ${err.message}`);
    }
}

export { connectRabbitMQ, sendToQueue, consumeQueue };