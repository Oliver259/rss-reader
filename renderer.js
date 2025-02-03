document.addEventListener('DOMContentLoaded', () => {
  const rssURLInput = document.getElementById("rss-url");
  const rssTitleInput = document.getElementById("rss-title");
  const addFeedButton = document.getElementById("add-feed");

  function updateAddFeedButtonState() {
    addFeedButton.disabled = !rssURLInput.value || !rssTitleInput.value;
  }

  rssURLInput.addEventListener("input", updateAddFeedButtonState);
  rssTitleInput.addEventListener("input", updateAddFeedButtonState);
  
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
    const url = rssURLInput.value;
    await fetchAndDisplayRSS(url);
  });

  async function fetchAndDisplayRSS(url) {
    try {
      const feed = await window.rssParser.fetchRSS(url);
      console.log(feed);
      const feedContainer = document.getElementById("rss-feed");
      feedContainer.innerHTML = ""; // Clear previous feed items
      
      const feedTitleElement = document.createElement("h2");
      feedTitleElement.className = "feed-title";
       feedTitleElement.innerText = feed.title;
       feedContainer.appendChild(feedTitleElement);

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
        <span data-url="${feed.url}">${feed.title}</span>
        <button class="remove-feed" style="padding: 5px 10px; background-color: #f56565; color: white; border-radius: 5px; cursor: pointer;" data-url="${feed.url}">Remove</button>
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
    const url = rssURLInput.value;
    const title = rssTitleInput.value;
    if (url && title) {
      await window.feedStore.addFeed(url, title);
      renderFeedList();
      rssURLInput.value = "";
      rssTitleInput.value = "";
      updateAddFeedButtonState
    }
  });

  // Event listener for fetching RSS feed from the list
  document.getElementById("feed-list").addEventListener("click", (event) => {
    if (event.target.tagName === "SPAN") {
      const url = event.target.getAttribute("data-url");
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