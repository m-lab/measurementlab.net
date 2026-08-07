---
permalink: accessing-data-buckets
title: "FAQ: Accessing M-Lab Data Buckets"
chapter: Accessing Data
chapterOrder: 5
order: 2
status: published
description: How to access M-Lab's raw NDT7 data in Google Cloud Storage using gsutil or gcloud without permission errors.
tags: [data-access]
difficulty: beginner
---

**Q: How do I access M-Lab's raw NDT7 data buckets? I can browse them in a web browser but get permission errors with gcloud.**

**A:** The M-Lab data buckets are publicly accessible and don't require special permissions. The error you're seeing occurs when trying to list all buckets in the project, which is a restricted operation. Instead, access the data directly by specifying the bucket path:

## Using gsutil

```bash
gsutil ls gs://archive-measurement-lab/ndt/ndt7/
```

## Using gcloud CLI

```bash
gcloud storage ls gs://archive-measurement-lab/ndt/ndt7/
```

## Data Organization

Raw NDT7 data is organized by date under the path:

```
gs://archive-measurement-lab/ndt/ndt7/YYYY/MM/DD/
```

For example, to access data from a specific date:

```bash
gsutil ls gs://archive-measurement-lab/ndt/ndt7/2024/04/05/
```

No authentication or special permissions are required to read the publicly available measurement data.
