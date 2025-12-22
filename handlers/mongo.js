import bcrypt from "bcrypt";
import { User } from "../model/user.js";
import { log, message, error, blue, green } from "../config/chalk.js";
import { Conversation } from "../model/conversation.js";
import { validateContactNumber } from "../validators/cmd.js";
import { askQuestion } from "../utils/readline.js";
import { formatDateTime } from "../utils/format.date.js";

async function authenticateUser(contactNumber) {
    try {
        validateContactNumber(contactNumber);

        const user = await User.findOne({ contactNumber });
        if (user) {
            const password = await askQuestion("enter password: ");
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.error(`${error("error")}: invalid password.`);
                process.exit(1);
            }

            console.log(`${log("log")}: authenticated user successfully.`);
            return user.userName;
        }

        const userName = await askQuestion("enter your name: ");
        const password = await askQuestion("create password: ");
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ userName, password: hashedPassword, contactNumber });

        console.log(`${log("log")}: authenticated user successfully.`);
        return userName;

    } catch (err) {
        console.error(`${error("error")}: ${err.message}`);
        process.exit(1);
    }
}

async function addMessage(senderContactNumber, receiverContactNumber, messageText) {
    try {
        const id = (senderContactNumber > receiverContactNumber) ?
            receiverContactNumber + senderContactNumber :
            senderContactNumber + receiverContactNumber;

        const msgObj = { senderContactNumber, message: messageText };

        const conversation = await Conversation.findOne({ id });
        if (conversation) {
            await Conversation.updateOne({ id }, { $push: { conversation: msgObj } });
        } else {
            await Conversation.create({ id, conversation: [msgObj] });
        }
    } catch (err) {
        console.error(`${error("error")}: ${err.message}`);
    }
}

async function getConversation(senderContactNumber, receiverContactNumber, receiverUserName) {
    try {
        const id = (senderContactNumber > receiverContactNumber) ?
            receiverContactNumber + senderContactNumber :
            senderContactNumber + receiverContactNumber;

        let flag = true;
        let skip = 0;

        console.log(`\n${message("message")}: CONVERSATION`);
        while (flag) {
            const data = await Conversation.aggregate([
                { $unwind: "$conversation" },
                { $sort: { "conversation.createdAt": -1 } },
                { $match: { id: id } },
                { $project: { conversation: "$conversation" } },
                { $skip: skip * 10 },
                { $limit: 10 }
            ]);

            if (data[0] === undefined) {
                console.log(`${message("message")}: no more conversation exists.`);
                console.log(`${message("message")}: continue your conversation.`);
                break;
            }
            
            console.log(`\n${message("PAGE:")} ${skip + 1}`);
            data.reverse().forEach(chat => {
                const isYou = chat.conversation.senderContactNumber === senderContactNumber;
                const nameColor = isYou ? blue : green;
                const name = isYou ? "You" : receiverUserName;
                const dateTime = `${formatDateTime(chat.conversation.createdAt)}`;
                console.log(`[${log(dateTime)}] ${nameColor(name)}: ${chat.conversation.message}`);
            });
            
            const response = await askQuestion(`view more conversation? (${message("yes")}/${error("no")}): `);
            if (response.toLowerCase() === "yes") {
                skip++;
                continue;
            } 
            else if (response.trim().toLowerCase() === "no") {
                console.log(`${message("message")}: continue your conversation.`);
                break;
            } else {
                console.log(`${message("message")}: invalid input.`);
                console.log(`${message("message")}: continue your conversation.`);
                break;
            }
        }

        console.log();
    } catch (err) {
        console.error(`${error("error")}: ${err.message}`);
    }
}

export {
    authenticateUser,
    addMessage,
    getConversation
};