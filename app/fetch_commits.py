# scripts/fetch_commits.py
import requests, json

OWNER = "0xdya"
REPO = "اسم_مشروعك"
TOKEN = "ghp_token"  
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
