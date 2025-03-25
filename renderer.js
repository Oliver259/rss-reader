// Notification functions
function showNotification(type, title, message, duration = 5000) {
  const notification = document.getElementById("notification");
  const notificationTitle = document.getElementById("notification-title");
  const notificationMessage = document.getElementById("notification-message");
  const notificationIcon = document.getElementById("notification-icon");

  // Set content
  notificationTitle.textContent = title;
  notificationMessage.textContent = message;

  // Remove any previous notification classes
  notification.className = "notification";

  // Set type-specific styling
  if (type === "success") {
    notification.classList.add("success-notification");
    notificationIcon.innerHTML =
      '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>';
  } else if (type === "error") {
    notification.classList.add("error-notification");
    notificationIcon.innerHTML =
      '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"></path></svg>';
  } else if (type === "info") {
    notification.classList.add("info-notification");
    notificationIcon.innerHTML =
      '<svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z"></path></svg>';
  }

  // Set the close button icon
  const closeButton = document.getElementById("close-notification");
  closeButton.innerHTML =
    '<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path></svg>';

  // Show notification
  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("opacity-100");
  }, 10);

  // Hide after duration
  if (duration) {
    setTimeout(hideNotification, duration);
  }
}

function hideNotification() {
  const notification = document.getElementById("notification");
  notification.classList.remove("opacity-100");
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {

  // Add event listener for importing opml files
  document.getElementById("import-opml").addEventListener("click", async () => {
    try {
      const result = await window.opmlHandler.importFeeds();
      showNotification(
        "success",
        "Import Successful",
        `Successfully imported ${result.stats.added} new feeds. ` +
          `${result.stats.skipped} existing feeds were skipped.`,
      );
      renderFeedList(); // Re-render the feed list
    } catch (error) {
      showNotification("error", "Import Failed", error.message);
    }
  });


  // Add event listener for notification close button
  document
    .getElementById("close-notification")
    .addEventListener("click", hideNotification);

  const rssURLInput = document.getElementById("rss-url");
  const rssTitleInput = document.getElementById("rss-title");
  const rssFolderInput = document.getElementById("rss-folder");
  const addFeedButton = document.getElementById("add-feed");
  const fetchRSSButton = document.getElementById("fetch-rss");

  // Disables the add feed button unless both RSS URL and title fields have values
  function toggleAddFeedButtonState() {
    addFeedButton.disabled = !rssURLInput.value || !rssTitleInput.value;
  }

  // Disables the fetch RSS button unless the RSS URL field has a value
  function toggleFetchRSSButtonState() {
    fetchRSSButton.disabled = !rssURLInput.value;
  }

  // Event listeners for input fields to enable/disable the add feed button
  rssURLInput.addEventListener("input", () => {
    toggleAddFeedButtonState();
    toggleFetchRSSButtonState();
  });
  rssTitleInput.addEventListener("input", toggleAddFeedButtonState);

  // Toggle dark mode
  document
    .getElementById("toggle-dark-mode")
    .addEventListener("click", async () => {
      const isDarkMode = await window.darkMode.toggle();
      document.getElementById("theme-source").innerHTML = isDarkMode
        ? "Dark"
        : "Light";

      // Add or remove dark class
      if (isDarkMode) {
        document.body.classList.add("dark");
        document.body.classList.remove("light");
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
      }
    });

  // Reset to system theme
  document
    .getElementById("reset-to-system")
    .addEventListener("click", async () => {
      await window.darkMode.system();
      document.getElementById("theme-source").innerHTML = "System";
    });

  // Fetches the RSS feed from the entered RSS feed URL
  fetchRSSButton.addEventListener("click", async () => {
    const url = rssURLInput.value;
    await fetchAndDisplayRSS(url);
  });

  // Function to fetch and display RSS feeds
  async function fetchAndDisplayRSS(url) {
    try {
      // Trim whitespace characters from the URL
      url = url.trim();
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

      // Show success notification
      showNotification(
        "success",
        "Feed Loaded",
        `Successfully loaded ${feed.title}`,
      );
    } catch (error) {
      if (
        error.message.includes("EAI_AGAIN") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ENOTFOUND")
      ) {
        showNotification(
          "error",
          "Connection Error",
          "Invalid URL - Try removing and readding RSS feed with a working URL",
        );
      } else if (error.message.includes("ERR_INVALID_PROTOCOL")) {
        showNotification(
          "error",
          "Protocol Error",
          "Invalid URL protocol - URLs should start with http:// or https://",
        );
      } else if (error.message.includes("Status code 404")) {
        showNotification(
          "error",
          "Not Found",
          "The RSS feed URL returned a 404 error (not found)",
        );
      } else {
        showNotification(
          "error",
          "Error",
          `Error fetching RSS feed: ${error.message}`,
        );
      }
      console.error("Error fetching RSS feed:", error.message);
    }
  }

  const feedList = document.getElementById("feed-list");

  // Function to render the list of saved feeds
  async function renderFeedList() {
  const feeds = await window.feedStore.getFeeds();
  feedList.innerHTML = "";

  // Group feeds by folder
  const feedsByFolder = feeds.reduce((acc, feed) => {
    const folder = feed.folder || "Uncategorized";
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(feed);
    return acc;
  }, {});

  // Create and append each folder and its feeds
  Object.entries(feedsByFolder).forEach(([folder, folderFeeds]) => {
    const folderContainer = document.createElement("div");
    folderContainer.className = "folder-container";

    // Create folder header if not Uncategorized
    if (folder !== "Uncategorized") {
      const folderHeader = document.createElement("h2");
      folderHeader.className = "folder-header text-2xl font-bold mb-4";
      folderHeader.textContent = folder;
      folderContainer.appendChild(folderHeader);
    }

    // Create grid container for feeds
    const feedsGrid = document.createElement("div");
    feedsGrid.className = "feed-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

    // Create and append each feed in the folder
    folderFeeds.forEach((feed) => {
      const feedItem = document.createElement("div");
      feedItem.className =
        "rss-item saved-feed-card-bg dark:bg-gray-800 py-2 rounded-lg shadow-md mb-4 flex flex-col justify-center items-center";
      feedItem.innerHTML = `
      <h3 class="text-xl font-bold text-center">${feed.title}</h3>
      <div class="flex justify-between">
        <button class="view-button mr-2 px-4 py-2 saved-feed-card-view-button saved-feed-card-button-text rounded hover:bg-blue-700" data-url="${feed.url}">View</button>
        <button class="remove-button px-4 py-2 saved-feed-card-remove-button saved-feed-card-button-text rounded hover:bg-red-700" data-url="${feed.url}">Remove</button>
      </div>
    `;

      feedsGrid.appendChild(feedItem);
    });

    folderContainer.appendChild(feedsGrid);
    feedList.appendChild(folderContainer);
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
        try {
          await window.feedStore.removeFeed(url);
          renderFeedList();
          showNotification(
            "info",
            "Feed Removed",
            "Feed has been removed from your list",
          );
        } catch (error) {
          showNotification(
            "error",
            "Error",
            `Failed to remove feed: ${error.message}`,
          );
        }
      });
    });
  }

  // Adds the entered rss feed and title to saved feeds list
  document.getElementById("add-feed").addEventListener("click", async () => {
    const url = rssURLInput.value.trim();
    const title = rssTitleInput.value.trim();
    const folder = rssFolderInput.value.trim();

    if (url && title) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        showNotification(
          "error",
          "Invalid URL",
          "URL must start with http:// or https://",
        );
        return;
      }
      try {
        await window.feedStore.addFeed(url, title, folder);
        renderFeedList();
        rssURLInput.value = "";
        rssTitleInput.value = "";
        rssFolderInput.value = "";
        toggleAddFeedButtonState();
        showNotification(
          "success",
          "Feed Added",
          `Successfully added "${title}" ${folder || "Default"} to your feeds`,
        );
      } catch (error) {
        showNotification(
          "error",
          "Error",
          `Failed to add feed: ${error.message}`,
        );
      }
    }
  });

  // Initial render of the feed list
  renderFeedList();
});
