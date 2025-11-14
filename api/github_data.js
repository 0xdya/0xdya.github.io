export default async function handler(req, res) {
  const username = "0xdya";
  const repoName = "0xdya.github.io";
  const branch = "main";
  const token = "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";

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json"
  };

  try {
    const [repoRes, userRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers }),
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/repos/${username}/${repoName}/commits?sha=${branch}&per_page=1`, { headers })
    ]);

    const [repoData, userData, commits] = await Promise.all([
      repoRes.json(),
      userRes.json(),
      commitsRes.json()
    ]);

    res.status(200).json({
      repo: repoData,
      user: userData,
      commit: commits[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch GitHub data" });

  }
      }
