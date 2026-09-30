---
permalink: test-rate-limits
title: "FAQ: Test Rate Limits"
chapter: Understanding Measurement
chapterOrder: 2
order: 3
status: published
description: M-Lab enforces 40 tests per day per IP address. Learn what this means and how to work within the limit.
tags: [Internet Quality]
difficulty: beginner
---

**Q: How many M-Lab tests can I run per day?**

**A:** M-Lab implements current rate limits of 20 requests in a 30 minute sliding window based on both IP address and user-agent, and a 40 request limit in a 12 hour sliding window based on IP address alone.

For software or hardware integrations M-Lab recommends testing no more than 4 times per day for any one device / internet connection.

## Key Points

- The limit is enforced per source IP address
- It covers all test types combined (not 40 per tool)
- The counter resets daily
- Exceeding this limit will result in test requests being rejected

## Need higher rate limits?

If you need to conduct measurements at a higher rate for legitimate research purposes, please contact M-Lab support at [support@measurementlab.net](mailto:support@measurementlab.net) to discuss your requirements. We may be able to accommodate special cases with proper justification.

## Alternative Approaches

- Distribute tests across multiple IP addresses if available
- Space out your measurements throughout the day
- Consider using M-Lab's historical datasets for analysis instead of running new tests

This rate limiting helps ensure the platform remains available and responsive for all users worldwide.
