# Jekyll Syntax Migration Notes

- **Total Removals:** 212 instances across 53 files
- **Link Targets Removed:** 208 instances
- **Image Sizing Removed:** 27 instances
- **Layout Styling Removed:** 27 instances
- **Other Removals:** 13 instances (inline styles, ID selectors)

---

## Notes on removals

- Image sizing attributes like `{: width="750"}` and `{: width="600"}` were removed from images.
- CSS class applications (`.pull-left`, `.pull-right`, `.center`, `.circle-list`, `.offset-box`) were removed. These can be modernized with Tailwind CSS utilities if needed.
- All `{:target="_blank"}` and variant patterns were removed. External links automatically open in new tabs via the `rehype-external-links` plugin configured in Astro.
- External links still open in new tabs automatically via `rehype-external-links` Astro plugin.
- Other Removals:
  - `{:style="display:block; margin-left:auto; margin-right:auto"}` - 7 instances
  - `{:style="border:1px solid black"}` - 4 instances
  - `{:style="list-style-type: circle"}` - 1 instance
  - `{:#bigquery-schema-fields}` - 1 instance

---

## Files with Non-Link Changes

These posts should be checked manually to make sure they display in a way we like.

| File                                      | Image Sizing | Layout Styling | Inline Styles | ID Selectors |
| ----------------------------------------- | ------------ | -------------- | ------------- | ------------ |
| 2014_interconnection_report.md            | -            | 2              | -             | -            |
| SIGCOMM2022.md                            | 2            | -              | -             | -            |
| cloudflare-aimscoredata-announcement.md   | 2            | -              | -             | -            |
| contributing-mlab-infrastructure.md       | 3            | -              | 3             | -            |
| data_duplication_writeup.md               | -            | -              | 5             | 1            |
| digital-inclusion-at-home.md              | -            | 10             | -             | -            |
| imc22-hackathon.md                        | 2            | -              | -             | -            |
| inspiring-michigan-broadband-summit.md    | -            | 3              | -             | -            |
| interconnection_and_measurement_update.md | 1            | 5              | -             | -            |
| mlab-hiring.md                            | -            | 2              | -             | -            |
| mlab-ripe.md                              | -            | 2              | -             | -            |
| mlab_asb2014.md                           | -            | 2              | -             | -            |
| open-measurement-gathering-1.md           | 2            | -              | -             | -            |
| overview-of-mlab-traceroute.md            | 5            | -              | -             | -            |
| research_update1.md                       | -            | 1              | -             | -            |
| ripestat_mlab_widgets.md                  | -            | 4              | -             | -            |
| short-ndt.md                              | 5            | -              | -             | -            |
| underload.md                              | 1            | -              | -             | -            |
| virtual-sites-gcp.md                      | 5            | -              | 5             | -            |

**Files in table:** 19 with non-link changes
**Files with only link target removals:** 34
**Total affected files:** 53

---
