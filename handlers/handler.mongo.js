import bcrypt from "bcrypt";
import { User } from "../model/model.user.js";
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
            
            console.log(`message: authenticated user successfully.`);
            return user.userName;
        }

        const userName = await askQuestion("enter your name: ");
        const password = await askQuestion("create password: ");
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ userName, password: hashedPassword, contactNumber });
        
        console.log(`message: authenticated user successfully.`);
        return userName;

    } catch (err) {
        console.error(`error: ${err.message}`);
        process.exit(1);
    }
}

export { authenticateUser };