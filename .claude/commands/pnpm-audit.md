Run pnpm audit and fix security vulnerabilities by upgrading parent packages or using pnpm overrides as a fallback.

## Arguments

This command accepts an optional audit report as an argument. If provided, the audit report will be parsed directly instead of running `pnpm audit`.

**Audit Report (if provided):**
$ARGUMENTS

## Overview

This command manages security vulnerabilities in dependencies with the following priority:

1. **Cleanup First**: Validate existing overrides and remove any that are no longer needed
2. **Primary Goal**: Upgrade the parent package that uses the vulnerable dependency
3. **Fallback**: Use pnpm overrides when the parent package cannot be upgraded

## Instructions

### Step 1: Validate and Clean Up Existing Overrides

Before running the audit, validate that all existing overrides in `package.json` are still necessary. Overrides may become obsolete when:

- The parent package has been upgraded to include the fix
- The overridden package is no longer in the dependency tree at all
- The project no longer uses the parent package that brought in the vulnerable dependency

**For each override in `pnpm.overrides`:**

1. Read the override details from `pnpm_overrides.md` to identify the parent package and overridden package

2. **Check if the overridden package is still in the project** (most important check):

   ```bash
   pnpm list <overridden-package> --depth 10
   ```

   If this returns no results, the package has been removed from the project entirely - the override is no longer needed.

3. **Check if the parent package is still in the project**:

   ```bash
   pnpm list <parent-package> --depth 0
   ```

   If the parent package is no longer installed, the override is likely obsolete.

4. **If the package is still present**, verify the full transitive dependency chain from the **npm registry** (NOT the lockfile):

   **CRITICAL: Never rely on `pnpm-lock.yaml` to determine dependency versions.** The lockfile can be stale and show old resolved versions. Always check the npm registry to see what version constraints each package in the chain actually declares.

   For each override, walk the full dependency chain on npm:

   ```
   # Use WebFetch to check each package in the chain from npm registry:
   # https://registry.npmjs.org/<parent-package>/<version>
   # Look at its dependencies to find the next package in the chain
   # Repeat until you reach the vulnerable package
   ```

   Example for a chain like `@nestjs/cli > glob > minimatch > @isaacs/brace-expansion`:
   - Check `https://registry.npmjs.org/@nestjs/cli/11.0.16` → what version of `glob` does it declare?
   - Check `https://registry.npmjs.org/glob/<that-version>` → what version of `minimatch`?
   - Check `https://registry.npmjs.org/minimatch/<that-version>` → what version of the vulnerable package?
   - If the final constraint now includes the patched version, the override may be removable.

5. **Ensure parent packages are on the latest version**: For each parent package documented in `pnpm_overrides.md`:

   a. Check the current version in package.json:

   ```bash
   grep -r '"<parent-package>"' --include="package.json" | head -5
   ```

   b. Check the latest available version:

   ```bash
   # Use WebFetch to check https://registry.npmjs.org/<parent-package>/latest
   ```

   c. If a newer version exists, upgrade the parent package in package.json to use the latest version with `^` prefix (e.g., `"^11.0.16"`), even if the upgrade doesn't fix the vulnerability. We should always be on the latest version.

   d. After upgrading, update the `**Parent Package**` line in `pnpm_overrides.md` to reflect the new version. Include the full dependency chain where helpful (e.g., `prisma@7.3.0 (via @prisma/dev@0.20.0 which uses hono@4.11.4)`).

6. **For each override that appears obsolete**:
   - Remove the override from `package.json`
   - Run `pnpm install` to update the lockfile
   - Run `pnpm audit` to verify the vulnerability doesn't reappear
   - If the vulnerability reappears, restore the override
   - If confirmed removed, move the entry in `pnpm_overrides.md` to the "Removed Overrides" section with:
     - Removal date
     - Reason (e.g., "package removed from project" or "parent-lib@2.0.0 now includes fix")

7. Update the summary table at the top of `pnpm_overrides.md` to remove entries for deleted overrides

### Step 2: Get Security Audit Report

**If an audit report was provided in the arguments above**, parse that report directly and skip running the audit command.

**If no audit report was provided**, run the security audit:

```bash
pnpm audit --audit-level=high
```

Parse the output (either from arguments or from running the command) to identify:

- **Vulnerable package**: The package with the security issue
- **Severity**: Critical, High, Medium, Low
- **Fixed version**: The version that resolves the vulnerability
- **Dependency path**: Which parent packages depend on the vulnerable package

### Step 3: Attempt Parent Package Upgrade

For each vulnerability found:

1. Identify the **direct dependency** in our project that transitively depends on the vulnerable package
2. **Walk the dependency chain on the npm registry** to understand exactly which package pins the vulnerable version:
   - Use `WebFetch` on `https://registry.npmjs.org/<package>/<version>` for each package in the chain
   - Check what version constraint each package declares for the next one in the chain
   - Identify the exact package in the chain that pins or constrains the vulnerable version
   - **Do NOT rely on `pnpm-lock.yaml`** — the lockfile shows resolved versions which may be stale
3. Check if there's a newer version of the direct dependency:
   ```bash
   # Use WebFetch to check https://registry.npmjs.org/<parent-package>/latest
   ```
4. If a newer version exists, **walk the chain again on npm** for that new version to confirm it actually resolves the vulnerable transitive dependency
5. If a fix is available via parent upgrade:
   ```bash
   pnpm up <parent-package>@latest --recursive
   ```
6. Run `pnpm audit` again to verify the fix

### Step 4: Apply Override (Fallback)

If the parent package cannot be upgraded (no fix available yet), use pnpm overrides:

1. Add the override to `package.json` under `pnpm.overrides`:

   ```json
   {
     "pnpm": {
       "overrides": {
         "<vulnerable-package>": ">=<fixed-version>"
       }
     }
   }
   ```

2. Run `pnpm install` to apply the override

3. Document the override in `pnpm_overrides.md` under "Current Overrides":

   ```markdown
   **<package-name> >=<version>**

   - **Added**: YYYY-MM-DD
   - **Reason**: <CVE-ID or description>
   - **Severity**: Critical/High/Medium/Low
   - **Parent Package**: <direct-dependency-name>@<version>
   - **Resolution Condition**: Remove this override once <parent-package> updates their dependency
   ```

4. Update the summary table at the top of `pnpm_overrides.md`

### Step 5: Verify Fixes

Run the security audit again to confirm all issues are resolved:

```bash
pnpm audit --audit-level=high
```

Run syncpack to fix version mismatches across workspaces:

```bash
pnpm syncpack:fix
pnpm syncpack:format
```

Run typecheck and build for the **entire project** to ensure nothing broke:

```bash
pnpm typecheck
```

If typecheck passes, run build:

```bash
pnpm build
```

Both commands run across all workspaces in the monorepo. All packages must pass before proceeding.

### Step 6: Summary

Provide a summary with:

**1. Overrides Removed:**
List any overrides that were removed because they are no longer needed.

| Override    | Reason for Removal                    |
| ----------- | ------------------------------------- |
| pkg@>=1.0.0 | parent-lib@2.0.0 now includes the fix |

**2. Parent Package Upgrades:**
List packages that were upgraded to fix vulnerabilities.

| Package | Old Version | New Version | Vulnerability Fixed |
| ------- | ----------- | ----------- | ------------------- |
| example | 1.2.3       | 1.2.5       | CVE-XXXX-XXXX       |

**3. New Overrides Added:**
List any new overrides that were added as fallbacks.

| Override    | Reason   | Parent Package | Resolution Condition          |
| ----------- | -------- | -------------- | ----------------------------- |
| pkg@>=1.0.0 | CVE-XXXX | parent-lib     | Upgrade parent-lib when fixed |

**4. Remaining Vulnerabilities:**
List any vulnerabilities that could not be fixed (if any) and explain why.

## Notes

- **NEVER rely on `pnpm-lock.yaml` to determine dependency versions** — always check the npm registry (`https://registry.npmjs.org/<package>/<version>`) to verify what version constraints each package actually declares. The lockfile can be stale and show old resolved versions.
- Always validate existing overrides first - stale overrides add unnecessary complexity
- Always prefer upgrading parent packages over using overrides
- Overrides force a specific version across all dependencies, which can cause compatibility issues
- Document all overrides in `pnpm_overrides.md` for future cleanup
- When checking parent package updates, look at both GitHub releases and npm package info
- Some vulnerabilities may be false positives or not applicable to our usage - document these in the summary
