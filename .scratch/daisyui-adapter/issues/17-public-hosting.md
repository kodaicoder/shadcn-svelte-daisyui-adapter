# Public hosting and publish

Type: task
Status: open
Blocked by: 08, 16

## Question

Where does the package live, and how does it stay published?

Required:
1. Pick the npm identity: package name, scope, and the bin name behind `pnpm dlx <pkg> init`. The name in 07 and 14 is a placeholder.
2. Version policy: the CLI writes its version into the stylesheet's header comment, so an exact version is what a project records. Decide when the number moves and how a mapping change is announced.
3. Publish path: which public repo the source lives in. This repo now has a remote
   (`github.com/kodaicoder/shadcn-svelte-daisyui-adapter`), so "new home" is reduced to whether the
   package ships from here or from a dedicated repo. Also settle the `prepare: tsc` build that
   produces `dist/` during `npm publish`.
4. Verify from a clean machine: a fresh SvelteKit project, `pnpm dlx shadcn-svelte@latest init`, then `pnpm dlx <pkg>@<exact> init`, then `pnpm build` with a real two-block theme under `src/`.
5. Record the licence, the changelog policy, and what happens to a project whose header comment names an older version.

DoD: a stranger can install with the two commands in 07 on a clean machine, and the package name and version are written into the map's Decisions so far.

## Answer

<!-- fill on resolution: package name, repo, version policy, clean-machine transcript -->
