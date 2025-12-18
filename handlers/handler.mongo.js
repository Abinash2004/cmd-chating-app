import bcrypt from "bcrypt";
import { User } from "../model/model.user.js";
import { Conversation } from "../model/model.conversation.js"
import { validateContactNumber } from "../validators/validator.cmd.js";
import { askQuestion } from "../utils/utils.readline.js";

async function authenticateUser(contactNumber) {
    try {
        validateContactNumber(contactNumber);
        
        const user = await User.findOne({ contactNumber });
        if (user) {
            const password = await askQuestion("enter password: ");
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                console.error(`error: invalid password.`);
                process.exit(1);
            }
            
            console.log(`log: authenticated user successfully.`);
            return user.userName;
        }

        const userName = await askQuestion("enter your name: ");
        const password = await askQuestion("create password: ");
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ userName, password: hashedPassword, contactNumber });
        
        console.log(`log: authenticated user successfully.`);
        return userName;

    } catch (err) {
        console.error(`error: ${err.message}`);
        process.exit(1);
    }
}

async function addMessage(senderContactNumber, receiverContactNumber, message) {
    try {
        const id = (senderContactNumber > receiverContactNumber) ? 
        receiverContactNumber + senderContactNumber : 
        senderContactNumber + receiverContactNumber;

        const msgObj = {senderContactNumber,message};

        const conversation = await Conversation.findOne({id});
        if (conversation) {
            await Conversation.updateOne({id},{$push: {conversation: msgObj}});
        } else {
            await Conversation.create({id,conversation: [msgObj]});
        }
    } catch(err) {
        console.error(`error: ${err.message}`);
    }
}

async function getConversation(senderContactNumber, receiverContactNumber, receiverUserName) {
    try {
        const id = (senderContactNumber > receiverContactNumber) ? 
        receiverContactNumber + senderContactNumber : 
        senderContactNumber + receiverContactNumber;

        const conversation = await Conversation.findOne({id});
        if (!conversation) {
            console.log("message: no past conversation exists.");
            return;
        }
        
        console.log("\nCONVERSATION:");
        conversation.conversation.map((chat) => {
            console.log(`${(chat.senderContactNumber === senderContactNumber) ? "You" : receiverUserName} : ${chat.message}`);
        });
        console.log("\n");
    } catch(err) {
        console.error(`error: ${err.message}`);
    }
}

export { 
    authenticateUser,
    addMessage,
    getConversation
};