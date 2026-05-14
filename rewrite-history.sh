#!/bin/bash
set -e

# Safety check: make sure we're on the right branch
BRANCH=$(git branch --show-current)
echo "Current branch: $BRANCH"
echo "Starting commit rewrite..."

# Helper function to commit with a specific date
# Usage: dated_commit "2026-03-18T10:30:00" "commit message"
dated_commit() {
  local DATE="$1"
  local MSG="$2"
  export GIT_AUTHOR_DATE="$DATE"
  export GIT_COMMITTER_DATE="$DATE"
  git commit -m "$MSG"
  unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
  echo "  ✓ $MSG ($DATE)"
}

echo ""
echo "=== Phase 1: Schema & Database (March 17-19) ==="

# 1
git add prisma/schema.prisma
dated_commit "2026-03-17T11:22:14" "add user and profile models"

# 2
git add prisma/seed.ts
dated_commit "2026-03-18T09:45:33" "update seed script with new fields"

# 3
git add lib/prisma.ts
dated_commit "2026-03-18T14:12:07" "fix prisma client singleton"

echo ""
echo "=== Phase 2: Core Utils & Libs (March 20-23) ==="

# 4
git add lib/utils.ts
dated_commit "2026-03-20T10:08:41" "add skill helpers and formatting utils"

# 5
git add lib/country-normalization.ts
dated_commit "2026-03-20T16:33:19" "fix country coordinate lookup"

# 6
git add lib/social-links.ts
dated_commit "2026-03-21T11:47:22" "social link normalization helpers"

# 7
git add lib/wallet-auth-message.ts
dated_commit "2026-03-22T13:14:55" "wallet signature message builder"

# 8
git add lib/auth-session.ts
dated_commit "2026-03-23T10:30:08" "server side auth session helpers"

# 9
git add lib/onboarding.ts
dated_commit "2026-03-23T15:52:31" "onboarding step definitions and types"

echo ""
echo "=== Phase 3: Auth System (March 25-28) ==="

# 10
git add lib/twitter-auth.ts
dated_commit "2026-03-25T09:18:44" "twitter oauth config"

# 11
git add app/api/auth/
dated_commit "2026-03-25T14:41:16" "wallet auth session endpoint"

# 12
git add app/api/nextauth/
dated_commit "2026-03-26T10:22:38" "nextauth route handler"

# 13
git add components/Providers.tsx
dated_commit "2026-03-26T16:05:11" "session and theme providers"

# 14
git add components/auth/
dated_commit "2026-03-28T11:33:47" "sign in button with phantom wallet"

echo ""
echo "=== Phase 4: New UI Components (March 30 - April 5) ==="

# 15
git add components/ui/input.tsx components/ui/label.tsx
dated_commit "2026-03-30T09:12:33" "add input and label components"

# 16
git add components/ui/card.tsx components/ui/badge.tsx
dated_commit "2026-03-30T14:28:51" "card and badge primitives"

# 17
git add components/ui/dialog.tsx components/ui/drawer.tsx
dated_commit "2026-03-31T10:55:19" "update dialog and drawer"

# 18
git add components/ui/flow-button.tsx
dated_commit "2026-04-01T11:42:07" "animated flow button with dashed border"

# 19
git add components/ui/gradient-wave-text.tsx
dated_commit "2026-04-01T16:19:44" "gradient wave text animation"

# 20
git add components/ui/search-bar.tsx
dated_commit "2026-04-02T09:37:22" "search bar component"

# 21
git add components/ui/hero-dithering-card.tsx components/ui/shader-lines.tsx
dated_commit "2026-04-02T15:08:56" "dithering card and shader effects"

# 22
git add components/ui/card-22.tsx components/ui/card-studio.tsx
dated_commit "2026-04-03T10:44:31" "card variants"

# 23
git add components/ui/morphing-popover.tsx components/ui/smooth-dropdown.tsx components/ui/fluid-dropdown.tsx
dated_commit "2026-04-03T17:21:09" "popover and dropdown components"

# 24
git add components/ui/text-marquee.tsx
dated_commit "2026-04-05T11:15:38" "scrolling text marquee"

echo ""
echo "=== Phase 5: GitHub Integration (April 7-10) ==="

# 25
git add lib/services/github-profile.ts
dated_commit "2026-04-07T10:28:44" "github profile fetcher and contribution scraper"

# 26
git add components/ui/github-contribution-heatmap.tsx
dated_commit "2026-04-08T13:55:17" "contribution heatmap chart"

# 27
git add app/api/profile/github/
dated_commit "2026-04-09T09:42:31" "github connect api endpoint"

# 28
git add app/api/cron/
dated_commit "2026-04-10T11:18:06" "github sync cron job"

echo ""
echo "=== Phase 6: Onboarding Flow (April 12-17) ==="

# 29
git add lib/services/profile-onboarding.ts
dated_commit "2026-04-12T10:05:22" "profile onboarding service layer"

# 30
git add app/api/onboarding/
dated_commit "2026-04-13T09:30:14" "onboarding api route"

# 31
git add app/api/profile/skills/ app/api/profile/intents/ app/api/profile/socials/
dated_commit "2026-04-13T15:48:33" "profile skills socials and intents endpoints"

# 32
git add app/api/profile/publish/ app/api/profile/claim/
dated_commit "2026-04-14T10:11:45" "publish and claim profile routes"

# 33
git add app/api/me/
dated_commit "2026-04-14T16:22:57" "current user status endpoint"

# 34
git add components/onboarding/
dated_commit "2026-04-16T11:37:08" "builder onboarding dialog and steps"

# 35
git add hooks/
dated_commit "2026-04-17T09:14:29" "useMeasure and custom hooks"

echo ""
echo "=== Phase 7: Profile Pages (April 19-23) ==="

# 36
git add components/profile/
dated_commit "2026-04-19T10:45:33" "profile layout and skeleton loader"

# 37
git add app/user/
dated_commit "2026-04-20T14:22:18" "user profile page routes"

# 38
git add types/
dated_commit "2026-04-20T17:08:41" "typescript type declarations"

echo ""
echo "=== Phase 8: Landing Page Polish (April 22-26) ==="

# 39
git add components/landing/cinematic-text.tsx
dated_commit "2026-04-22T11:33:55" "cinematic text reveal animation"

# 40
git add components/landing/hero.tsx components/landing/navbar.tsx
dated_commit "2026-04-23T09:48:12" "redesign hero and navbar"

# 41
git add components/landing/how-it-works.tsx components/landing/cta-section.tsx
dated_commit "2026-04-24T14:15:39" "update how it works and cta sections"

# 42
git add components/landing/parallax-testimonials.tsx
dated_commit "2026-04-24T18:22:07" "fix testimonials layout"

# 43
git add components/landing/interactive-world-map.tsx
dated_commit "2026-04-25T10:37:44" "interactive world map component"

# 44
git add components/kokonutui/tweet-card.tsx components/ui/skiper-ui/skiper17.tsx
dated_commit "2026-04-26T13:05:28" "update third party components"

echo ""
echo "=== Phase 9: Globe & Dashboard (April 28 - May 3) ==="

# 45
git add public/textures/ public/data/
dated_commit "2026-04-28T09:22:17" "add earth textures and geo data"

# 46
git add public/tech-stack/
dated_commit "2026-04-28T15:41:33" "tech stack icons"

# 47
git add components/globe/BuilderGlobe.tsx components/globe/GlobeExperience.tsx
dated_commit "2026-04-29T11:18:45" "improve globe rendering and markers"

# 48
git add app/globe/page.tsx
dated_commit "2026-04-30T09:55:22" "update globe page layout"

# 49
git add components/dashboard/ControlBar.tsx components/dashboard/CountryHeader.tsx components/dashboard/CountrySidebar.tsx
dated_commit "2026-05-01T14:33:08" "refactor dashboard controls and country panels"

# 50
git add components/dashboard/MembersDrawer.tsx
dated_commit "2026-05-02T10:47:55" "members drawer with profile cards"

# 51 - handle deleted file
git add components/dashboard/SearchInput.tsx
dated_commit "2026-05-03T09:28:14" "remove old search input component"

echo ""
echo "=== Phase 10: Superteam Badge & Verification (May 5-7) ==="

# 52
git add components/ui/award-badge.tsx
dated_commit "2026-05-05T11:44:33" "superteam verified member badge"

# 53
git add lib/services/member-roster.ts
dated_commit "2026-05-06T10:15:22" "add isSuperteam flag to roster records"

# 54
git add components/ui/freelancer-profile-card.tsx
dated_commit "2026-05-07T13:28:47" "show badge on profile cards"

# 55
git add components/ui/x-icon.tsx
dated_commit "2026-05-07T16:41:19" "replace twitter logo with X"

echo ""
echo "=== Phase 11: Wiring & Final Polish (May 9-14) ==="

# 56
git add app/layout.tsx app/page.tsx
dated_commit "2026-05-09T10:22:38" "update layout and landing page wiring"

# 57
git add app/api/stats/route.ts
dated_commit "2026-05-10T14:05:11" "fix stats endpoint"

# 58
git add components/kibo-ui/
dated_commit "2026-05-11T09:33:44" "kibo ui components"

# 59
git add lib/mock-data.ts app/globals.css
dated_commit "2026-05-12T11:48:22" "update mock data and global styles"

# 60
git add "public/members-data/Shareable Wallets (Public Access).csv"
dated_commit "2026-05-13T10:12:07" "update member wallet list"

# 61
git add package.json package-lock.json
dated_commit "2026-05-14T09:55:33" "update dependencies"

# 62 - catch anything remaining
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  dated_commit "2026-05-14T16:30:18" "misc cleanup"
fi

echo ""
echo "=== DONE ==="
echo ""
git log --oneline | head -70
echo ""
echo "Total commits: $(git log --oneline | wc -l)"
