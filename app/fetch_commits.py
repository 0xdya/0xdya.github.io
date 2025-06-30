# scripts/fetch_commits.py
import requests, json

OWNER = "0xdya"
REPO = "0xdya.github.io"
TOKEN = "ghp_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"  
commits = []
page = 1

while True:
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/commits?per_page=100&page={page}"
    headers = {"Authorization": f"token {TOKEN}"}
    res = requests.get(url, headers=headers)

    if res.status_code != 200 or not res.json():
        break

    commits += res.json()
    page += 1

with open("commit.json", "w", encoding="utf-8") as f:
    json.dump({"commits": commits}, f, ensure_ascii=False, indent=2)
