# AA matrix

Painted from `render.json` (D:\Workspace\DesignSystem\New_Project\.scratch\daisyui-adapter\evidence\38-outline-surface\render.json), reference rows from `parseTheme` (D:\Workspace\DesignSystem\New_Project\src\daisyui-theme.css).

### light repaired pairs

| pair | foreground | background | ratio | threshold | pass |
| --- | --- | --- | --- | --- | --- |
| dialog close | rgb(0, 23, 58) | rgb(214, 243, 246) | 15.22 | 4.5 | yes |
| sheet close | rgb(0, 23, 58) | rgb(214, 243, 246) | 15.22 | 4.5 | yes |
| calendar hover | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| range hover | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| range middle | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| dropdown destructive | rgb(63, 23, 109) | rgb(243, 225, 225) | 10.69 | 4.5 | yes |
| context destructive | rgb(63, 23, 109) | rgb(243, 225, 225) | 10.69 | 4.5 | yes |
| menubar destructive | rgb(63, 23, 109) | rgb(243, 225, 225) | 10.69 | 4.5 | yes |
| chart tooltip | rgb(0, 23, 58) | rgb(250, 250, 250) | 17 | 4.5 | yes |
| bubble muted | rgb(0, 23, 58) | rgb(214, 243, 246) | 15.22 | 4.5 | yes |

### light tones

| tone | text | text vs page | fill | fill vs page | known limit | text on fill | pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| success | rgb(0, 94, 115) | 7.06 | rgb(0, 211, 144) | 1.88 | yes | 5.12 | yes |
| warning | rgb(0, 106, 85) | 6.3 | rgb(252, 183, 0) | 1.69 | yes | 5.24 | yes |
| info | rgb(0, 82, 132) | 7.92 | rgb(0, 186, 254) | 2.13 | yes | 6.34 | yes |
| destructive | rgb(63, 23, 109) | 12.94 | rgb(191, 0, 4) | 6.25 | no | 5.97 | yes |

### dark repaired pairs

| pair | foreground | background | ratio | threshold | pass |
| --- | --- | --- | --- | --- | --- |
| dialog close | rgb(226, 229, 233) | rgb(1, 2, 17) | 16.32 | 4.5 | yes |
| sheet close | rgb(226, 229, 233) | rgb(1, 2, 17) | 16.32 | 4.5 | yes |
| calendar hover | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| range hover | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| range middle | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| dropdown destructive | rgb(195, 158, 215) | rgb(44, 14, 29) | 7.77 | 4.5 | yes |
| context destructive | rgb(195, 158, 215) | rgb(44, 14, 29) | 7.77 | 4.5 | yes |
| menubar destructive | rgb(195, 158, 215) | rgb(44, 14, 29) | 7.77 | 4.5 | yes |
| chart tooltip | rgb(226, 229, 233) | rgb(7, 17, 35) | 14.92 | 4.5 | yes |
| bubble muted | rgb(226, 229, 233) | rgb(1, 2, 17) | 16.32 | 4.5 | yes |

### dark tones

| tone | text | text vs page | fill | fill vs page | known limit | text on fill | pass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| success | rgb(154, 219, 244) | 12.41 | rgb(0, 211, 144) | 9.63 | no | 5.12 | yes |
| warning | rgb(250, 196, 235) | 12.72 | rgb(252, 183, 0) | 10.7 | no | 5.24 | yes |
| info | rgb(173, 209, 249) | 11.91 | rgb(0, 186, 254) | 8.49 | no | 6.34 | yes |
| destructive | rgb(195, 158, 215) | 8.26 | rgb(191, 0, 4) | 2.89 | yes | 5.97 | yes |

## Reference rows

| scheme | tone | text vs page | fill vs page | known limit | text on fill |
| --- | --- | --- | --- | --- | --- |
| light | success | 7.95 | 2.41 | yes | 6.05 |
| light | warning | 6.62 | 1.86 | yes | 7.63 |
| light | info | 7.89 | 2.13 | yes | 6.31 |
| light | destructive | 12.92 | 6.24 | no | 5.95 |
| dark | success | 11.28 | 7.49 | no | 6.05 |
| dark | warning | 13 | 9.67 | no | 7.63 |
| dark | info | 11.88 | 8.47 | no | 6.31 |
| dark | destructive | 8.24 | 2.89 | yes | 5.95 |

## Known limit

A filled status variant whose fill measures below 3:1 against the page is a known limit. The filled variants carry no border; the tone is still held at 4.5:1 as text on the page for the outline, ghost and link presentations.

## Findings

None.

## Failures

None.
