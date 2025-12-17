function validateContactNumber(contactNumber) {
    if (!(/^[0-9]{10}$/.test(contactNumber))) {
        console.error("error: invalid contact number.");
        process.exit(1);
    }
    console.log("message: contact number validated successfully.");
}

async function validatePort(port1,port2) {
    const p1 = Number(port1);
    const p2 = Number(port2);

    if (!Number.isInteger(p1) || !Number.isInteger(p2)) {
        console.error("error: ports must be integers.");
        process.exit(1);
    } else if (p1 < 1024 || p1 > 49151 || p2 < 1024 || p2 > 49151) {
        console.error("error: ports must be in range 1024-49151.");
        process.exit(1);
    } else if (p1 === p2) {
        console.error("error: sender's port and receiver's port must not be same.");
        process.exit(1);
    }
    
    console.log("message: ports validated successfully.");
}

export { 
    validateContactNumber,
    validatePort 
};