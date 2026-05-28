$ErrorActionPreference = 'Stop'

# Map: source file -> target page path
$map = @(
  @{ src = 'Landing.ts';            dst = 'app/page.tsx' },
  @{ src = 'GetMembership.ts';      dst = 'app/join-membership/page.tsx' },
  @{ src = 'JoinMembershipForm.ts';  dst = 'app/join-membership-form/page.tsx' },
  @{ src = 'Membership.ts';         dst = 'app/membership/[userEmail]/page.tsx' },
  @{ src = 'Terms.ts';              dst = 'app/terms/page.tsx' },
  @{ src = 'Privacy.ts';            dst = 'app/privacy/page.tsx' },
  @{ src = 'Refund.ts';             dst = 'app/refund/page.tsx' },
  @{ src = 'Referral.ts';           dst = 'app/referral-program/page.tsx' },
  @{ src = 'TrailJobs.ts';          dst = 'app/jobs/page.tsx' },
  @{ src = 'FreeJobs.ts';           dst = 'app/explore-jobs/page.tsx' },
  @{ src = 'TestPayment.ts';        dst = 'app/test-payment/page.tsx' },
  @{ src = 'AddJobs.ts';            dst = 'app/add-jobs-manual/page.tsx' }
)

$srcRoot = 'c:\HiringBull\webs\src\Screens'
$dstRoot = 'c:\HiringBull\web'

foreach ($entry in $map) {
  $srcPath = Join-Path $srcRoot $entry.src
  $dstPath = Join-Path $dstRoot $entry.dst
  $dstDir  = Split-Path -Path $dstPath -Parent

  if (-not (Test-Path -LiteralPath $dstDir)) {
    New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
  }

  $content = [System.IO.File]::ReadAllText($srcPath, [System.Text.Encoding]::UTF8)

  # ---- transformations ----
  # MUI v4 -> v5
  $content = $content -replace '@material-ui/icons/', '@mui/icons-material/'
  $content = $content -replace '@material-ui/core', '@mui/material'

  # asset imports -> string consts (all known assets)
  $content = $content -replace "import\s+logo\s+from\s+'\.\./utils/logo\.png';?", "const logo = '/logo.png';"
  $content = $content -replace "import\s+logoBig\s+from\s+'\.\./utils/logo-big\.png';?", "const logoBig = '/logo-big.png';"
  $content = $content -replace "import\s+membershipGoldCoin\s+from\s+'\.\./utils/membership-gold-coin\.gif';?", "const membershipGoldCoin = '/membership-gold-coin.gif';"
  $content = $content -replace "import\s+social1\s+from\s+'\.\./utils/social1\.png';?", "const social1 = '/social1.png';"
  $content = $content -replace "import\s+social2\s+from\s+'\.\./utils/social2\.png';?", "const social2 = '/social2.png';"

  # env var
  $content = $content -replace 'process\.env\.REACT_APP_API_URL', 'process.env.NEXT_PUBLIC_API_URL'

  # react-router-dom imports
  # useParams -> next/navigation
  $content = $content -replace "import\s+\{\s*useParams\s*\}\s+from\s+'react-router-dom';?", "import { useParams } from 'next/navigation';"
  # Link -> next/link (we'll handle as default import)
  $content = $content -replace "import\s+\{\s*Link\s*\}\s+from\s+'react-router-dom';?", "import Link from 'next/link';"
  # Any remaining react-router-dom import lines - delete them
  $content = $content -replace "(?m)^import.*from\s+'react-router-dom';\s*$", ''

  # Link prop `to=` -> `href=`
  $content = $content -replace '<Link\s+([^>]*?)\bto=', '<Link $1href='
  # as={Link} to= pattern
  $content = $content -replace '(as=\{Link\}[^>]*?)\bto=', '$1href='

  # Membership.ts uses const { userEmail } = useParams() -- next/navigation typing
  # We'll add a cast for safety
  $content = $content -replace 'const\s+\{\s*userEmail\s*\}\s*=\s*useParams\(\)', "const { userEmail } = useParams() as { userEmail: string }"

  # Prepend use client + ts-nocheck (ported JS-as-TS, skip type strictness)
  $header = "// @ts-nocheck`r`n`"use client`";`r`n"
  $content = $header + $content

  [System.IO.File]::WriteAllText($dstPath, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "  ported -> $($entry.dst)"
}

Write-Host "done."
