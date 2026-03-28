export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
  
    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;
  
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.github_commits}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          username: '0xdya',
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    });
  
    const data = await response.json();
  
    if (data.errors) {
      return res.status(400).json({ error: data.errors[0].message });
    }
  
    res.status(200).json(data.data.user.contributionsCollection.contributionCalendar);
  }