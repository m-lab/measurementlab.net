---
permalink: accessing-data-buckets
title: "FAQ: Accessing M-Lab Data Buckets"
chapter: Accessing Data
chapterOrder: 5
order: 2
status: published
description: How to access M-Lab's raw NDT7 data in Google Cloud Storage using gcloud without permission errors.
tags: [Data Access]
difficulty: beginner
---

**Q: How do I access M-Lab's raw NDT7 data buckets? I get permission errors with gcloud.**

**A:** Read access to the M-Lab data buckets is granted to Google accounts that are members of the [M-Lab Discuss group](https://groups.google.com/a/measurementlab.net/g/discuss). Anonymous requests are denied. To access the data:

1. Subscribe the Google account you want to use to the [M-Lab Discuss group](https://groups.google.com/a/measurementlab.net/g/discuss).
2. Log in to gcloud with that same account:

```bash
gcloud auth login
```

3. Access the data by specifying the bucket path:

```bash
gcloud storage ls gs://archive-measurement-lab/ndt/ndt7/
```

Listing all buckets in the project fails even for members, because it is a restricted operation. Always access the data directly by specifying the bucket path, as shown above.

For non-interactive access with a service account, see [Archival Data](/data/docs/archival-data/).

## Data Organization

Raw NDT7 data is organized by date under the path:

```
gs://archive-measurement-lab/ndt/ndt7/YYYY/MM/DD/
```

For example, to access data from a specific date:

```bash
gcloud storage ls gs://archive-measurement-lab/ndt/ndt7/2024/04/05/
```

If you get a `401` or `403` error, check that `gcloud config get-value account` shows the account you subscribed to the Discuss group.
