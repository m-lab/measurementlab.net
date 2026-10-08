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

**Q: How do I access M-Lab's raw NDT7 data buckets? I can browse them in a web browser but get permission errors with gcloud.**

**A:** The M-Lab data buckets are publicly accessible and don't require special permissions. However, `gcloud storage ls` requires authentication by default. If you are not logged in, you need to add the `CLOUDSDK_AUTH_DISABLE_CREDENTIALS=true` override:

```bash
CLOUDSDK_AUTH_DISABLE_CREDENTIALS=true gcloud storage ls gs://archive-measurement-lab/ndt/ndt7/
```

Also, listing all buckets in the project fails, because it is a restricted operation. Instead, access the data directly by specifying the bucket path, as shown above.

## Data Organization

Raw NDT7 data is organized by date under the path:

```
gs://archive-measurement-lab/ndt/ndt7/YYYY/MM/DD/
```

For example, to access data from a specific date:

```bash
CLOUDSDK_AUTH_DISABLE_CREDENTIALS=true gcloud storage ls gs://archive-measurement-lab/ndt/ndt7/2024/04/05/
```

Reading the public data requires no special permissions. If you are not logged in to gcloud, `CLOUDSDK_AUTH_DISABLE_CREDENTIALS=true` tells it to send anonymous requests instead of looking for an account.
