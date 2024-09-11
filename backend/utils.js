function formatResponse(statusCode, message, data = null) {
    const response = {
        status: statusCode,
        message: message,
    };

    if (data !== null) {
        response.data = data;
    }

    return response;
}

module.exports = {
    formatResponse,
};