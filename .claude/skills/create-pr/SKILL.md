---
name: create-pr
description: Push the current branch and open a GitHub pull request with the project template.
disable-model-invocation: true
---

# /create-pr

1. If on `main`, stop: ask for a branch name (`feat/<short-name>`) and create it first.
2. Make sure everything is committed and `pnpm check` passes.
3. `git push -u origin HEAD`.
4. `gh pr create --base main` with a title in the commit format and this body:

   ## What & why

   <what changed and why>

   ## How to test
   1. <steps on the Vercel preview, or locally with `pnpm dev`>

   ## Checklist
   - [ ] `pnpm check` passes
   - [ ] Checked on mobile width and with keyboard only
   - [ ] Loading, empty and error states reviewed

   ## Screenshots

   <before / after for UI changes>

5. Print the PR URL. If the repo is connected to Vercel, it posts the preview link on the PR.
