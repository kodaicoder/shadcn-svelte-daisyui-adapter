# AA matrix

Painted from `render.json` (D:\Workspace\DesignSystem\New_Project\.scratch\daisyui-adapter\evidence\37-contrast-warning\render.json), reference rows from `parseTheme` (D:\Workspace\DesignSystem\New_Project\src\daisyui-theme.css).

### light repaired pairs

| pair | foreground | background | ratio | threshold | pass |
| --- | --- | --- | --- | --- | --- |
| dialog close | rgb(0, 23, 58) | rgb(214, 243, 246) | 15.22 | 4.5 | yes |
| sheet close | rgb(0, 23, 58) | rgb(214, 243, 246) | 15.22 | 4.5 | yes |
| calendar hover | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| range hover | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| range middle | rgb(237, 241, 254) | rgb(0, 128, 51) | 4.5 | 4.5 | yes |
| dropdown destructive | rgb(63, 23, 109) | rgb(248, 229, 229) | 11.15 | 4.5 | yes |
| context destructive | rgb(63, 23, 109) | rgb(248, 229, 229) | 11.15 | 4.5 | yes |
| menubar destructive | rgb(63, 23, 109) | rgb(248, 229, 229) | 11.15 | 4.5 | yes |
| chart tooltip | rgb(0, 23, 58) | rgb(255, 255, 255) | 17.74 | 4.5 | yes |
| bubble muted | rgb(0, 23, 58) | rgb(214, 243, 246) | 15.22 | 4.5 | yes |

### light tones

| tone | text | text vs page | fill | fill vs page | known limit | text on fill | border | border vs page | pass |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| success | rgb(0, 63, 87) | 11.36 | rgb(0, 126, 113) | 4.97 | no | 4.73 | rgb(0, 63, 87) | 11.36 | yes |
| warning | rgb(0, 102, 83) | 6.94 | rgb(238, 175, 0) | 1.95 | yes | 8.4 | rgb(0, 102, 83) | 6.94 | yes |
| info | rgb(0, 49, 117) | 12.38 | rgb(0, 87, 218) | 6.22 | no | 5.72 | rgb(0, 49, 117) | 12.38 | yes |
| destructive | rgb(63, 23, 109) | 13.51 | rgb(191, 0, 4) | 6.53 | no | 5.97 | rgb(63, 23, 109) | 13.51 | yes |

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

| tone | text | text vs page | fill | fill vs page | known limit | text on fill | border | border vs page | pass |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| success | rgb(155, 194, 215) | 9.96 | rgb(0, 150, 137) | 5.14 | no | 3.49 | rgb(155, 194, 215) | 9.96 | yes |
| warning | rgb(150, 228, 226) | 13.02 | rgb(238, 175, 0) | 9.67 | no | 1.85 | rgb(150, 228, 226) | 13.02 | yes |
| info | rgb(159, 190, 248) | 10.05 | rgb(42, 126, 255) | 4.96 | no | 3.49 | rgb(159, 190, 248) | 10.05 | yes |
| destructive | rgb(195, 158, 215) | 8.26 | rgb(191, 0, 4) | 2.89 | yes | 5.97 | rgb(195, 158, 215) | 8.26 | yes |

## Reference rows

| scheme | tone | text vs page | fill vs page | known limit | text on fill |
| --- | --- | --- | --- | --- | --- |
| light | success | 8.3 | 2.52 | yes | 6.05 |
| light | warning | 6.91 | 1.95 | yes | 7.63 |
| light | info | 8.24 | 2.22 | yes | 6.31 |
| light | destructive | 13.49 | 6.52 | no | 5.95 |
| dark | success | 11.28 | 7.49 | no | 6.05 |
| dark | warning | 13 | 9.67 | no | 7.63 |
| dark | info | 11.88 | 8.47 | no | 6.31 |
| dark | destructive | 8.24 | 2.89 | yes | 5.95 |

## Known limit

The filled status and destructive variants stay below 3:1 against the page (dark destructive is the 2.89 row); the component boundary is the text-tone border, which is held at or above 3:1.

## Findings

- dark: success filled text is 3.49:1 against its fill; the theme's own success-content sets this pair
- dark: warning filled text is 1.85:1 against its fill; the theme's own warning-content sets this pair
- dark: info filled text is 3.49:1 against its fill; the theme's own info-content sets this pair

## Failures

None.
