// --- Load Assets Function ---
export function loadAssets(assets, callback) {
    const promises = assets.map(asset => {
        return new Promise((resolve, reject) => {
            let element;

            if (asset.type === "script") {
                // Create a script element
                element = document.createElement('script');
                element.src = asset.src;
                element.async = asset.async || true;
            } else if (asset.type === "stylesheet") {
                // Create a link element for CSS
                element = document.createElement('link');
                element.href = asset.src;
                element.rel = "stylesheet";
            } else if (asset.type === "font") {
                // Create a link element for fonts
                element = document.createElement('link');
                element.href = asset.src;
                element.rel = "stylesheet";
            } else {
                console.error(`Unknown asset type: ${asset.type}`);
                return reject(`Unknown asset type: ${asset.type}`);
            }

            // Attach event listeners
            element.onload = () => {
                console.log(`Loaded: ${asset.src}`);
                resolve();
            };
            element.onerror = () => {
                console.error(`Failed to load: ${asset.src}`);
                reject(`Failed to load: ${asset.src}`);
            };

            // Append the element to the appropriate location
            if (asset.type === "script") {
                document.body.appendChild(element);
            } else {
                document.head.appendChild(element);
            }
        });
    });

    // Wait for all assets to load, then execute the callback
    Promise.all(promises)
        .then(() => {
            console.log("All assets loaded.");
            if (typeof callback === "function") {
                callback();
            }
        })
        .catch(error => console.error("Error loading assets:", error));
}

// --- Destroy Charts and Tables Function ---
export function destroyChartsAndTables() {
    // 1. Destroy Chart.js instance if it exists
    if (window.chartInstance && typeof window.chartInstance.destroy === 'function') {
        window.chartInstance.destroy();
        window.chartInstance = null;
    }

    // 2. Destroy all Tabulator tables stored in containers with _tabulatorTable
    const containers = document.querySelectorAll('[data-acc-text]');
    containers.forEach(container => {
        if (container._tabulatorTable && typeof container._tabulatorTable.destroy === 'function') {
            container._tabulatorTable.destroy();
            container._tabulatorTable = null;
        }
        container.innerHTML = ""; // Clean up the container
    });

    // 3. Remove the div that holds the canvas (for Chart.js)
    var chartDiv = document.querySelector(".chart-view");
    if (chartDiv && chartDiv.parentNode) {
        chartDiv.parentNode.removeChild(chartDiv);
    }

    console.log("All charts and all Tabulator tables destroyed.");
}
