export default async function handler(req, res) {
  const token = process.env.GITHUB_token; 
  const username = "0xdya";
  const repo = "0xdya.github.io";
  const branch = "main";
  const perPage = 30;

  const url = `https://api.github.com/repos/${username}/${repo}/commits?sha=${branch}&per_page=${perPage}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل جلب الكوميتات" });
  
  }
}
