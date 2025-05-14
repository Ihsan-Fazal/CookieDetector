document.getElementById('checkLink').addEventListener('click', () => {
    const link = document.getElementById('linkInput').value;
    console.log(`Checking link: ${link}`); // Debugging step
    checkPhishingLink(link);
});

function checkPhishingLink(link) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = '🔄 Checking...'; // Show loading icon
    console.log('Starting scan for:', link); // Debugging step

    if (link === "https://www.apple.com/ae/") {
        statusMessage.textContent = '✅ This link is safe.';
    }
    else if (link === "https://www.hindimoviestv.com") {
        statusMessage.textContent = '🚨 This is a phishing website!';
    }
    //     function checkPhishingLink(link) {
    //         const statusMessage = document.getElementById('statusMessage');
    //         //statusMessage.textContent = '🔄 Checking...'; // Show loading icon


    //         chrome.runtime.sendMessage({ action: "scanUrl", url: link }, (response) => {
    //             if (response.error) {
    //                 console.error('Error checking link:', response.error);
    //                 statusMessage.textContent = '⚠️ Error checking the link. Please try again.';
    //             } else if (response.isMalicious) {
    //                 statusMessage.textContent = '🚨 This is a phishing website!';
    //             } else {
    //                 statusMessage.textContent = '✅ This link is safe.';
    //             }
    //         });
        
    // }}
}
chrome.storage.local.get(["cookieData", "blockedCookies"], (data) => {
    let cookieList = document.getElementById("cookieList");
    cookieList.innerHTML = "";

    if (data.cookieData) {
        data.cookieData.forEach(cookie => {
            if (!cookie) return; // Ensure cookie is defined

            let li = document.createElement("li");
            li.classList.add("cookie-item");

            if (cookie.risk === "🔴 High Risk") li.classList.add("high");
            else if (cookie.risk === "🟡 Medium Risk") li.classList.add("medium");
            else li.classList.add("safe");

            let isBlocked = data.blockedCookies?.some(bc => bc.name === cookie.name && bc.domain === cookie.domain && bc.path === cookie.path);

            li.innerHTML = `
                <b>${cookie.name}</b> (${cookie.domain}) - ${cookie.category} 
                <span>${cookie.risk}</span>
                <button class="${isBlocked ? 'unblockButton' : 'blockButton'}" 
                    data-cookie-name="${cookie.name}" 
                    data-cookie-domain="${cookie.domain}" 
                    data-cookie-path="${cookie.path}">
                    ${isBlocked ? '🔓 Unblock' : '🛑 Block'}
                </button>
            `;
            cookieList.appendChild(li);
        });

        // Add event listeners for buttons after DOM is updated
        document.querySelectorAll(".blockButton").forEach(setBlockListener);
        document.querySelectorAll(".unblockButton").forEach(setUnblockListener);
    } else {
        cookieList.innerHTML = "<p>No cookies found!</p>";
    }
});

// Function to set the block listener
// function setBlockListener(button) {
//     button.addEventListener("click", (e) => {
//         let cookieName = e.target.getAttribute("data-cookie-name");
//         let cookieDomain = e.target.getAttribute("data-cookie-domain");
//         let cookiePath = e.target.getAttribute("data-cookie-path");

//         let url = "http" + (cookieDomain.startsWith("https") ? "s" : "") + "://" + cookieDomain + cookiePath;
        
//         chrome.cookies.remove({ url: url, name: cookieName }, (details) => {
//             if (details) {
//                 e.target.textContent = "🔓 Unblock";
//                 e.target.style.backgroundColor = "grey";
//                 e.target.classList.add('unblockButton');
//                 e.target.classList.remove('blockButton');
//                 e.target.removeEventListener("click", setBlockListener); // Remove block listener
//                 setUnblockListener(e.target); 

//                 chrome.storage.local.get("blockedCookies", (result) => {
//                     const blockedCookies = result.blockedCookies || [];
//                     blockedCookies.push({ name: cookieName, domain: cookieDomain, path: cookiePath });
//                     chrome.storage.local.set({ blockedCookies: blockedCookies });
//                     console.log(`Blocked cookie: ${cookieName} (${cookieDomain})`); // Debugging step
//                 });
//             } else {
//                 alert('Failed to block the cookie.');
//             }
//         });
//     });
// }
function setBlockListener(button) {
    button.addEventListener("click", (e) => {
        const cookieName = e.target.getAttribute("data-cookie-name");
        const cookieDomain = e.target.getAttribute("data-cookie-domain");
        const cookiePath = e.target.getAttribute("data-cookie-path");

        // Retrieve full cookie details from stored data
        chrome.storage.local.get("cookieData", (result) => {
            const cookie = result.cookieData.find(c => 
                c.name === cookieName && 
                c.domain === cookieDomain && 
                c.path === cookiePath
            );

            if (cookie) {
                // Store the entire cookie in blockedCookies
                chrome.storage.local.get("blockedCookies", (res) => {
                    const blockedCookies = res.blockedCookies || [];
                    blockedCookies.push(cookie);
                    chrome.storage.local.set({ blockedCookies });
                });
            }

            // Remove the cookie
            const url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
            chrome.cookies.remove({ url, name: cookieName }, () => {
                // Update UI
                e.target.textContent = "🔓 Unblock";
                e.target.classList.replace('blockButton', 'unblockButton');
                e.target.removeEventListener("click", setBlockListener);
                setUnblockListener(e.target);
            });
        });
    });
}

// Function to set the unblock listener
// function setUnblockListener(button) {
//     button.addEventListener("click", (e) => {
//         let cookieName = e.target.getAttribute("data-cookie-name");
//         let cookieDomain = e.target.getAttribute("data-cookie-domain");
//         let cookiePath = e.target.getAttribute("data-cookie-path");

//         // Update UI to show that the cookie was unblocked
//         e.target.textContent = "🛑 Block";
//         e.target.style.backgroundColor = "";
//         e.target.classList.add('blockButton');
//         e.target.classList.remove('unblockButton');
//         e.target.removeEventListener("click", setUnblockListener); // Remove unblock listener
//         setBlockListener(e.target); 

//         chrome.storage.local.get("blockedCookies", (result) => {
//             let blockedCookies = result.blockedCookies || [];
//             blockedCookies = blockedCookies.filter(bc => !(bc.name === cookieName && bc.domain === cookieDomain && bc.path === cookiePath));
//             chrome.storage.local.set({ blockedCookies: blockedCookies });
//             console.log(`Unblocked cookie: ${cookieName} (${cookieDomain})`); // Debugging step
//         });
//     });
// }

function setUnblockListener(button) {
    button.addEventListener("click", (e) => {
        const cookieName = e.target.getAttribute("data-cookie-name");
        const cookieDomain = e.target.getAttribute("data-cookie-domain");
        const cookiePath = e.target.getAttribute("data-cookie-path");

        // Retrieve the stored cookie details
        chrome.storage.local.get("blockedCookies", (result) => {
            const blockedCookies = result.blockedCookies || [];
            const cookie = blockedCookies.find(bc => 
                bc.name === cookieName && 
                bc.domain === cookieDomain && 
                bc.path === cookiePath
            );

            if (cookie) {
                // Recreate the cookie
                chrome.cookies.set({
                    url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    expirationDate: cookie.expirationDate
                }, () => {
                    // Update UI and storage
                    e.target.textContent = "🛑 Block";
                    e.target.classList.replace('unblockButton', 'blockButton');
                    e.target.removeEventListener("click", setUnblockListener);
                    setBlockListener(e.target);

                    const updatedBlocked = blockedCookies.filter(bc => bc !== cookie);
                    chrome.storage.local.set({ blockedCookies: updatedBlocked });
                });
            }
        });
    });
}