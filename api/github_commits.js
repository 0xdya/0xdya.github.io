export default async function handler(req, res) {
  const token = process.env.github_commits;
  const username = "0xdya";
  const repo = "0xdya.github.io";
  const branch = "main";

  let page = 1;
  let allCommits = [];

  try {
    while (true) {
      const url = `https://api.github.com/repos/${username}/${repo}/commits?sha=${branch}&per_page=100&page=${page}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json"
        }
      });

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) break;

      allCommits = allCommits.concat(data);

      if (data.length < 100) break;

      page++;
    }

    res.status(200).json(allCommits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل جلب الكوميتات" });
  }
}
