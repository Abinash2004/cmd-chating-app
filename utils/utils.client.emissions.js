async function requestUserInfo(socketClient) {
    return await new Promise((resolve) => {
        socketClient.emit("requestUserInfo");
        socketClient.on("userInfo", ({userName, contactNumber}) => {
            resolve({
                peerUserName: userName,
                peerContactNumber: contactNumber 
            })
        });
    });
}

export { requestUserInfo };