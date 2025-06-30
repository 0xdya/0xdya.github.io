export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  const repo = "0xdya.github.io";
  const username = "0xdya";
  const branch = "main";
  const perPage = 100;

  const response = await fetch(
    `https://api.github.com/repos/${username}/${repo}/commits?sha=${branch}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
