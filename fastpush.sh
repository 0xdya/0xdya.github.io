ascii_logo() {
cat << "EOF"
███████╗ █████╗ ███████╗████████╗     ██████╗ ██╗   ██╗███████╗██╗  ██╗
██╔════╝██╔══██╗██╔════╝╚══██╔══╝     ██╔══██╗██║   ██║██╔════╝██║  ██║
█████╗  ███████║███████╗   ██║        ██████╔╝██║   ██║███████╗███████║
██╔══╝  ██╔══██║╚════██║   ██║        ██╔═══╝ ██║   ██║╚════██║██╔══██║
██║     ██║  ██║███████║   ██║ by     ██║     ╚██████╔╝███████║██║  ██║
╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝ @0xdya ╚═╝      ╚═════╝ ╚══════╝╚═╝  ╚═╝                      
see wiki on: https://d1wiki.vercel.app/fastpush/
EOF
}
  
check_dep() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "install $1 first"
    exit 1
  fi
}

ascii_logo
check_dep git
check_dep node
check_dep npm

if [ ! -d .git ]; then
  echo "repo not connected, initializing..."
  git init >/dev/null 2>&1

  read -p "username/repo: " repo
  git remote add origin "https://github.com/$repo/" >/dev/null 2>&1

  read -p "branch: " branch
  git branch -M "$branch" >/dev/null 2>&1
fi

git add . >/dev/null 2>&1
read -p "commit: " msg
git commit -m "$msg" >/dev/null 2>&1
git push origin "$(git branch --show-current)" --force >/dev/null 2>&1
echo "done"
