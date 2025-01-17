document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

document.getElementById('reset-to-system').addEventListener('click', async () => {
  await window.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
})

document.getElementById('fetch-rss').addEventListener('click', async () => {
  const url = document.getElementById('rss-url').value;
  await fetchAndDisplayRSS(url);
});

async function fetchAndDisplayRSS(url) {
  try {
    const feed = await window.rssParser.fetchRSS(url);
    const feedContainer = document.getElementById("rss-feed");
    feedContainer.innerHTML = ''; // Clear previous feed items
    feed.items.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "rss-item";
      itemElement.innerHTML = `
        <h3>${item.title}</h3>
        <h4>${item.author || item.creator}<br>${item.pubDate}</h4>
        <p>${item.content || item['content:encoded']}</p>
        <a href="${item.link}" target="_blank">Read more</a>
      `;
      feedContainer.appendChild(itemElement);
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
  }
}