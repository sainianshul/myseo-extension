document.addEventListener("DOMContentLoaded", function () {
    // Version checker
    fetch("https://raw.githubusercontent.com/Kazuto335/seo-tool-extension/refs/heads/master/version.json")
        .then(res => res.json())
        .then(data => {
            const remoteVersion = data.version;
            const message = data.message || "New update available!";
            const currentVersion = chrome.runtime.getManifest().version;

            if (remoteVersion !== currentVersion) {
                const updateBox = document.getElementById("updatePopup");
                document.getElementById("updateMessage").innerText = message;
                updateBox.classList.remove("d-none");
            }
        })
        .catch(err => {
            console.warn("Version check failed:", err);
        });

    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");

    tabLinks.forEach((tab) => {
        tab.addEventListener("click", function () {
            tabLinks.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) => content.classList.remove("active"));

            this.classList.add("active");
            document.getElementById(this.dataset.tab).classList.add("active");
        });
    });

    // Automatically analyze current page on popup open
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: extractSEOData
        }, (results) => {
            if (results && results[0] && results[0].result) {
                let data = results[0].result;

                // Basic SEO Info
                const title = data.title || "";
                document.getElementById("title").innerText = title;
                document.querySelector("#structure .row:nth-of-type(1) .col.text-end").innerText = `${title.length}/60`;
                document.querySelector("#structure .row:nth-of-type(1) .col.text-end").style.color = title.length > 60 ? "red" : "inherit";

                const description = data.description || "";
                document.getElementById("description").innerText = description;
                document.querySelector("#structure .row:nth-of-type(2) .col.text-end").innerText = `${description.length}/160`;
                document.querySelector("#structure .row:nth-of-type(2) .col.text-end").style.color = description.length > 160 ? "red" : "inherit";

                document.getElementById("canonical").innerText = data.canonical;
                document.getElementById("robots").innerText = data.robots;
                document.getElementById("wordCount").innerText = data.wordCount;
                document.getElementById("lastModified").innerText = formatLastModified(data.lastModified);

                // ✅ Combined output: Platform | Language
                document.getElementById("platform").innerText = data.platform;

                displayHeadings("h1", data.h1);
                displayHeadings("h2", data.h2);
                displayHeadings("h3", data.h3);

                // Tracking
                document.getElementById("gtm").innerText = data.trackingTags.GTM !== "Not Found" ? `✅ ${data.trackingTags.GTM}` : "❌ Not Found";
                document.getElementById("ga4").innerText = data.trackingTags.GA4 !== "Not Found" ? `✅ ${data.trackingTags.GA4}` : "❌ Not Found";
                document.getElementById("msClarity").innerText = data.trackingTags.MSClarity !== "Not Found" ? `✅ ${data.trackingTags.MSClarity}` : "❌ Not Found";
            }
        });
    });
});

function formatLastModified(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Function to show headings
function displayHeadings(tag, headings) {
    const container = document.getElementById(tag);
    const countElement = document.getElementById(tag.toUpperCase() + "Count");
    const toggleIcon = document.getElementById("toggle" + tag.toUpperCase());

    container.innerHTML = "";
    countElement.innerText = headings.length;

    if (headings.length > 0) {
        headings.forEach((text, index) => {
            let div = document.createElement("div");
            div.textContent = text;
            if (index >= 4) div.classList.add("hidden");
            container.appendChild(div);
        });

        if (headings.length > 4) {
            toggleIcon.classList.remove("d-none", "rotated");
            toggleIcon.textContent = "▶";

            toggleIcon.onclick = () => {
                const isExpanded = container.querySelectorAll(".hidden").length === 0;
                container.querySelectorAll("div").forEach((el, i) => {
                    if (i >= 4) el.classList.toggle("hidden");
                });
                toggleIcon.textContent = isExpanded ? "▶" : "▼";
                toggleIcon.classList.toggle("rotated", !isExpanded);
            };
        } else {
            toggleIcon.classList.add("d-none");
        }
    } else {
        container.innerText = `No ${tag.toUpperCase()} found`;
        toggleIcon.classList.add("d-none");
    }
}

// Core script to extract platform + language + SEO info
function extractSEOData() {
    function detectPlatform() {
        const generator = document.querySelector('meta[name="generator"]')?.content.toLowerCase() || "";
        const html = document.documentElement.outerHTML.toLowerCase();

        if (html.includes("wix.com") || html.includes("wixsite") || html.includes("wixpress")) return "Wix";
        if (html.includes("shopify.com") || html.includes("cdn.shopify")) return "Shopify";
        if (html.includes("squarespace.com")) return "Squarespace";
        if (html.includes("joomla")) return "Joomla";
        if (generator.includes("drupal") || html.includes("drupal")) return "Drupal";
        if (generator.includes("magento") || html.includes("magento")) return "Magento";
        if (html.includes("blogspot.com") || html.includes("b:template") || html.includes("b:skin")) return "Blogger";
        if (html.includes("webflow.com") || html.includes("w-webflow")) return "Webflow";
        if (generator.includes("ghost") || html.includes("/ghost/")) return "Ghost";
        if (generator.includes("typo3") || html.includes("/typo3/")) return "TYPO3";
        if (html.includes("prestashop") || html.includes("/prestashop/")) return "PrestaShop";
        if (html.includes("powered by craft cms") || html.includes("craftcms.com")) return "Craft CMS";
        if (html.includes("cdn.bc0a.com") || html.includes("stencil.js")) return "BigCommerce";
        if (html.includes("weebly.com") || html.includes("weeblycloud.com") || generator.includes("weebly")) return "Weebly";
        if (html.includes("hs-script-loader") || html.includes("hsforms.net")) return "HubSpot CMS";
        if (html.includes("zyro.com") || html.includes("zyro-section")) return "Zyro";
        if (html.includes("sitecore.net") || html.includes(".scmscript")) return "Sitecore";
        if (generator.includes("wordpress") || html.includes("wp-content")) return "WordPress";
        return "Unknown";
    }

    function detectLanguage() {
        const html = document.documentElement.outerHTML.toLowerCase();
        if (html.includes(".php") || html.includes("wp-content")) return "PHP";
        if (html.includes("django") || html.includes(".py") || html.includes("python")) return "Python";
        if (html.includes("node.js") || html.includes("express") || html.includes("next.js") || html.includes("window.__next_data__")) return "Node.js (JavaScript)";
        if (html.includes(".jsp") || html.includes("java")) return "Java (JSP)";
        if (html.includes(".aspx") || html.includes("dotnet") || html.includes("asp.net")) return "ASP.NET (C#)";
        if (html.includes("ruby") || html.includes("rails")) return "Ruby (Rails)";
        return "Unknown";
    }

    // Get SEO elements
    let title = document.querySelector("title")?.innerText || "Not Found";
    let description = document.querySelector("meta[name='description']")?.content || "Not Found";
    let canonical = document.querySelector("link[rel='canonical']")?.href || "Not Found";
    let robots = document.querySelector("meta[name='robots']")?.content || "Not Found";
    let wordCount = (document.body?.innerText || "").trim().split(/\s+/).length;

    let trackingTags = {
        GTM: "Not Found",
        GA4: "Not Found",
        MSClarity: "Not Found"
    };

    // Detect scripts for tracking
    document.querySelectorAll("script").forEach(script => {
        let content = script.innerText || script.src;
        if (content.includes("googletagmanager.com/gtm.js?id=")) {
            const match = content.match(/GTM-[A-Z0-9]+/);
            if (match) trackingTags.GTM = match[0];
        }
        if (content.includes("gtag('config'")) {
            const match = content.match(/G-[A-Z0-9]+/);
            if (match) trackingTags.GA4 = match[0];
        }
        if (content.includes("clarity.ms/tag/")) {
            const match = content.match(/clarity\.ms\/tag\/([a-z0-9]+)/i);
            if (match) trackingTags.MSClarity = match[1];
        }
    });

    const headings = (tag) => [...document.querySelectorAll(tag)].map(el => el.innerText.trim()).filter(Boolean);

    return {
        title,
        description,
        canonical,
        robots,
        wordCount,
        lastModified: document.lastModified,
        platform: `${detectPlatform()} | ${detectLanguage()}`,
        h1: headings("h1"),
        h2: headings("h2"),
        h3: headings("h3"),
        trackingTags
    };
}
