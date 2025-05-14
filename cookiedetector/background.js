// chrome.cookies.getAll({}, (cookies) => {
//     let cookieData = cookies.map(cookie => {
//         let category = "Essential"; // Default category
//         let riskLevel = "🟢 Safe"; // Default risk level

//         if (cookie.name.includes("track") || cookie.domain.includes("ads")) {
//             category = "Tracking";
//             riskLevel = "🔴 High Risk";
//         } else if (cookie.domain.includes("analytics")) {
//             category = "Analytics";
//             riskLevel = "🟡 Medium Risk";
//         } else if (cookie.domain.includes("session")) {
//             category = "Essential";
//             riskLevel = "🟢 Safe";
//         }

//         return { name: cookie.name, domain: cookie.domain, category, risk: riskLevel };
//     });

//     chrome.storage.local.set({ "cookieData": cookieData });
// });

chrome.cookies.getAll({}, (cookies) => {
    let cookieData = cookies.map(cookie => {
        let category = "Essential";
        let riskLevel = "🟢 Safe";

        if (cookie.name.includes("track") || cookie.domain.includes("ads")) {
            category = "Tracking";
            riskLevel = "🔴 High Risk";
        } else if (cookie.domain.includes("analytics")) {
            category = "Analytics";
            riskLevel = "🟡 Medium Risk";
        }

        // Store all necessary cookie properties
        return { 
            name: cookie.name,
            domain: cookie.domain,
            path: cookie.path,
            value: cookie.value,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            expirationDate: cookie.expirationDate,
            category,
            risk: riskLevel
        };
    });

    chrome.storage.local.set({ "cookieData": cookieData });
});

const API_KEY = '7784bfc684b9cc8523d764cd38a52285fe92085674dcaaa4663a5daa6793ff15';
const SUBMIT_URL = 'https://www.virustotal.com/api/v3/urls';
const REPORT_URL = 'https://www.virustotal.com/api/v3/analyses';

//const encodedUrl = encodeURIComponent(url); // URL encode the URL

function scanUrl(url) {
    return new Promise((resolve, reject) => {
        fetch(SUBMIT_URL, {
            method: 'POST',
            headers: {
                'x-apikey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: new URLSearchParams({ url: url }) // Send as JSON
        })
        .then(response => response.json())
        .then(data => {
            if (!data.data || !data.data.id) {
                throw new Error("Invalid response from VirusTotal API.");
            }

            const analysisId = data.data.id;
            let timeoutHandle;

            // Function to check report status
            const pollReport = () => {
                fetch(`${REPORT_URL}/${analysisId}`, {
                    method: 'GET',
                    headers: { 'x-apikey': API_KEY }
                })
                .then(response => response.json())
                .then(report => {
                    if (!report.data || !report.data.attributes) {
                        throw new Error("Invalid analysis report data.");
                    }

                    if (report.data.attributes.status === 'completed') {
                        clearTimeout(timeoutHandle); // Stop timeout if completed

                        if (report.data.attributes.stats.malicious > 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        setTimeout(pollReport, 1000); // Poll again after 1 second
                    }
                })
                .catch(error => reject(error));
            };

            // Set timeout to avoid endless checking
            timeoutHandle = setTimeout(() => {
                reject(new Error('Analysis timed out'));
            }, 10000); // Increased to 10 seconds for better reliability

            pollReport(); // Start polling
        })
        .catch(error => reject(error));
    });
}


chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        scanUrl(details.url)
            .then(isMalicious => {
                if (isMalicious) {
                    alert(`Warning: The URL ${details.url} is flagged as malicious.`);
                }
            })
            .catch(error => console.error('Error scanning URL:', error));
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Handle messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanUrl") {
        scanUrl(message.url)
            .then(isMalicious => sendResponse({ isMalicious }))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Keeps sendResponse alive for async response
    }
});