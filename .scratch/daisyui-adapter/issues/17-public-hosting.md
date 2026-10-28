# Public hosting and publish

Type: task
Status: open
Blocked by: 08, 16

## Question

Where does the public registry live, and how does it stay published?

Required:
1. Pick the home: a new public repo with the registry project, or a folder inside an existing one. This repo has no remote today.
2. Scaffold `registry.json` plus the item files and the `registry:build` script.
3. Choose the host and confirm it serves static JSON at a stable path (`/r/<name>.json`).
4. Deploy, then verify from a clean machine that `add <public-url>` works.
5. Record the licence, the versioning policy, and how a change to the mapping is announced.

DoD: a stranger can install from the public URL, and the URL is written into the map's Decisions so far.

## Answer

<!-- fill on resolution: repo, host, URL, build command, version policy -->
