document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById("toggle-dark-mode")
    .addEventListener("click", async () => {
      const isDarkMode = await window.darkMode.toggle();
      document.getElementById("theme-source").innerHTML = isDarkMode
        ? "Dark"
        : "Light";
    });

  document
    .getElementById("reset-to-system")
    .addEventListener("click", async () => {
      await window.darkMode.system();
      document.getElementById("theme-source").innerHTML = "System";
    });

  document.getElementById("fetch-rss").addEventListener("click", async () => {
    const url = document.getElementById("rss-url").value;
    await fetchAndDisplayRSS(url);
  });

  async function fetchAndDisplayRSS(url) {
    try {
      const feed = await window.rssParser.fetchRSS(url);
      const feedContainer = document.getElementById("rss-feed");
      feedContainer.innerHTML = ""; // Clear previous feed items
      feed.items.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "rss-item";
        itemElement.innerHTML = `
          <h3>${item.title}</h3>
          <h4>${item.author || item.creator}<br>${item.pubDate}</h4>
          <p>${item.content || item["content:encoded"]}</p>
          <a href="${item.link}" target="_blank">Read more</a>
        `;
        feedContainer.appendChild(itemElement);
      });
    } catch (error) {
      console.error("Error fetching RSS feed:", error);
    }
  }

  // Function to render the list of saved feeds
  async function renderFeedList() {
    const feeds = await window.feedStore.getFeeds();
    const feedList = document.getElementById("feed-list");
    feedList.innerHTML = "";
    feeds.forEach((feed, index) => {
      const feedItem = document.createElement("li");
      feedItem.style.display = "flex";
      feedItem.style.justifyContent = "space-between";
      feedItem.style.alignItems = "center";
      feedItem.innerHTML = `
        <span>${feed}</span>
        <button class="remove-feed" style="padding: 5px 10px; background-color: #f56565; color: white; border-radius: 5px; cursor: pointer;" data-url="${feed}">Remove</button>
      `;
      feedList.appendChild(feedItem);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll(".remove-feed").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const url = event.target.getAttribute("data-url");
        await window.feedStore.removeFeed(url);
        renderFeedList();
      });
    });
  }

  // Event listener for adding a new feed
  document.getElementById("add-feed").addEventListener("click", async () => {
    const url = document.getElementById("rss-url").value;
    if (url) {
      await window.feedStore.addFeed(url);
      renderFeedList();
      document.getElementById("rss-url").value = "";
    }
  });

  // Event listener for fetching RSS feed from the list
  document.getElementById("feed-list").addEventListener("click", (event) => {
    if (event.target.tagName === "SPAN") {
      const url = event.target.textContent;
      fetchAndDisplayRSS(url);
    }
  });

  // Initial render of the feed list
  renderFeedList();

  // Persisting data using electron-settings
  document.getElementById("submit").addEventListener("click", async () => {
    const sample = document.getElementById("sample").value;
    console.log("Sample Text Entered - " + sample);
    console.log("Persisting Data in electron-settings");
    await window.settings.setSampleData(sample);
  });

  window.settings.getSampleData().then((value) => {
    console.log("Persisted Value - " + value);
    document.getElementById("sample").value = value || "";
  });
});