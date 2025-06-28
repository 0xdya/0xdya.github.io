#!/bin/bash

echo "🔄 Deploying to Firebase..."
firebase deploy

echo "📦 Committing to Git..."
git add .
git commit -m "uodate $(date '+%Y-%m-%d %H:%M:%S')"
git push

echo "✅ Done!"
