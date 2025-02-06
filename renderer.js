document.addEventListener("DOMContentLoaded", () => {
  const rssURLInput = document.getElementById("rss-url");
  const rssTitleInput = document.getElementById("rss-title");
  const addFeedButton = document.getElementById("add-feed");

  // Disables the add feed button unless both RSS URL and title fields have values
  function toggleAddFeedButtonState() {
    addFeedButton.disabled = !rssURLInput.value || !rssTitleInput.value;
  }

  // Event listeners for input fields to enable/disable the add feed button
  rssURLInput.addEventListener("input", toggleAddFeedButtonState);
  rssTitleInput.addEventListener("input", toggleAddFeedButtonState);

  // Toggle dark mode
  document
    .getElementById("toggle-dark-mode")
    .addEventListener("click", async () => {
      const isDarkMode = await window.darkMode.toggle();
      document.getElementById("theme-source").innerHTML = isDarkMode
        ? "Dark"
        : "Light";
    });

  // Reset to system theme
  document
    .getElementById("reset-to-system")
    .addEventListener("click", async () => {
      await window.darkMode.system();
      document.getElementById("theme-source").innerHTML = "System";
    });

  // Fetches the RSS feed from the entered RSS feed URL
  document.getElementById("fetch-rss").addEventListener("click", async () => {
    const url = rssURLInput.value;
    await fetchAndDisplayRSS(url);
  });

  // Function to fetch and display RSS feeds
  async function fetchAndDisplayRSS(url) {
    try {
      const feed = await window.rssParser.fetchRSS(url);
      console.log(feed);
      const feedContainer = document.getElementById("rss-feed");
      feedContainer.innerHTML = ""; // Clear previous feed items

      // Display feed title
      const feedTitleElement = document.createElement("h2");
      feedTitleElement.className = "feed-title";
      feedTitleElement.innerText = feed.title;
      feedContainer.appendChild(feedTitleElement);

      // Display each feed item
      feed.items.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "rss-item";

        // Define item.description with a default value if it is undefined
        item.description = item.description || "";

        // Construct the inner HTML for the item
        let itemContent = `
        <h3>${item.title}</h3>
        <h4>${item.author || item.creator}<br>${item.pubDate}</h4>
        <p>${item.content || item["content:encoded"] || item.description}</p>
      `;

        // Check if the description already contains a "Read more" link
        if (
          !item.description.includes("Read more") &&
          !itemContent.includes("Read more")
        ) {
          itemContent += `<a href="${item.link}" target="_blank">Read more</a>`;
        }

        itemElement.innerHTML = itemContent;
        feedContainer.appendChild(itemElement);
      });
    } catch (error) {
      console.error("Error fetching RSS feed:", error);
    }
  }

  const feedList = document.getElementById("feed-list");

  // Function to render the list of saved feeds
  async function renderFeedList() {
    const feeds = await window.feedStore.getFeeds();
    feedList.innerHTML = ""; // Clear the feed list

    // Create and append each item to the feed list
    feeds.forEach((feed) => {
      const feedItem = document.createElement("div");
      feedItem.className =
        "rss-item saved-feed-card-bg dark:bg-gray-800 py-2 rounded-lg shadow-md mb-4 flex flex-col justify-center items-center";
      feedItem.innerHTML = `
      <h3 class="text-xl font-bold" text-center>${feed.title}</h3>
      <div class="flex justify-between">
        <button class="view-button mr-2 px-4 py-2 saved-feed-card-view-button saved-feed-card-button-text rounded hover:bg-blue-700" data-url="${feed.url}">View</button>
        <button class="remove-button px-4 py-2 saved-feed-card-remove-button saved-feed-card-button-text rounded hover:bg-red-700" data-url="${feed.url}">Remove</button>
      </div>
    `;
      feedList.appendChild(feedItem);

      // Remove mb-4 class from the last feed item to make padding more uniform
      const lastFeedItem = feedList.lastElementChild;
      if (lastFeedItem) {
        lastFeedItem.classList.remove("mb-4");
      }
    });

    // Loads the relevant rss feed when view button is clicked
    document.querySelectorAll(".view-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        const url = event.target.getAttribute("data-url");
        fetchAndDisplayRSS(url);
        document.getElementById("rss-display").classList.remove("hidden");
      });
    });

    // Removes the relevant rss feed when remove button is clicked
    document.querySelectorAll(".remove-button").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const url = event.target.getAttribute("data-url");
        await window.feedStore.removeFeed(url);
        renderFeedList();
      });
    });
  }

  // Adds the entered rss feed and title to saved feeds list
  document.getElementById("add-feed").addEventListener("click", async () => {
    const url = rssURLInput.value;
    const title = rssTitleInput.value;
    if (url && title) {
      await window.feedStore.addFeed(url, title);
      renderFeedList();
      rssURLInput.value = "";
      rssTitleInput.value = "";
      toggleAddFeedButtonState;
    }
  });

  // Initial render of the feed list
  renderFeedList();
});
