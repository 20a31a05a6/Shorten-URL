// Get DOM elements
const shortenBtn = document.getElementById("shorten");
const longUrlInput = document.getElementById("longurl");
const shortUrlInput = document.getElementById("shorturl");
const copyBtn = document.getElementById("copy");
const resultContainer = document.querySelector(".result-container"); // Add this container in your HTML

// Event listeners
shortenBtn.addEventListener('click', shortenUrl);

copyBtn.addEventListener('click', copyShortUrl);

// URL Shortening Function
async function shortenUrl() {
    const longURL = longUrlInput.value.trim();
    
    // Validate input
    if (!longURL) {
        showError("Please enter a URL");
        return;
    }
    
    // Validate URL format
    if (!isValidUrl(longURL)) {
        showError("Please enter a valid URL (include http:// or https://)");
        return;
    }

    try {
        // Show loading state
        shortenBtn.disabled = true;
        shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Shortening...';
        
        // Call API
        const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(longURL)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to shorten URL");
        }
        
        const data = await response.json();
        
        // Display result
        shortUrlInput.value = data.result.short_link;
        showResult(longURL, data.result.short_link);
        
    } catch (error) {
        showError(error.message);
    } finally {
        // Reset button state
        shortenBtn.disabled = false;
        shortenBtn.textContent = 'Shorten';
    }
}

// Copy Function
async function copyShortUrl() {
    try {
        await navigator.clipboard.writeText(shortUrlInput.value);
        
        // Visual feedback
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('copied');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.classList.remove('copied');
        }, 2000);
        
    } catch (error) {
        showError("Failed to copy URL");
    }
}

// Helper Functions
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showResult(originalUrl, shortUrl) {
    // Create or update result display
    if (!resultContainer) {
        // Create result container if it doesn't exist
        const container = document.createElement('div');
        container.className = 'result-container';
        container.innerHTML = `
            <div class="result-box">
                <div>
                    <div class="original-url">${originalUrl}</div>
                    <a href="${shortUrl}" target="_blank" class="short-url">${shortUrl}</a>
                </div>
            </div>
        `;
        document.querySelector('.main').appendChild(container);
    } else {
        // Update existing result container
        resultContainer.innerHTML = `
            <div class="result-box">
                <div>
                    <div class="original-url">${originalUrl}</div>
                    <a href="${shortUrl}" target="_blank" class="short-url">${shortUrl}</a>
                </div>
            </div>
        `;
        resultContainer.style.display = 'block';
    }
}

function showError(message) {
    // Create or update error display
    let errorElement = document.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        document.querySelector('.main').prepend(errorElement);
    }
    
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> ${message}
    `;
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorElement.style.opacity = '0';
        setTimeout(() => errorElement.remove(), 300);
    }, 5000);
}
