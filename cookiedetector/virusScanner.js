const suspiciousWords = ['login', 'update', 'verify', 'secure', 'account', 'bank', 'password'];
const unsecureProtocols = ['http:'];

function scanUrl(url) {
    return new Promise((resolve) => {
        const urlObj = new URL(url);
        const isUnsecure = unsecureProtocols.includes(urlObj.protocol);
        const containsSuspiciousWords = suspiciousWords.some(word => url.includes(word));

        if (isUnsecure || containsSuspiciousWords) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}