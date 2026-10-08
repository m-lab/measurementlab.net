---
permalink: test-rate-limits
title: "FAQ: Test Rate Limits"
chapter: Understanding Measurement
chapterOrder: 2
order: 3
status: published
description: As a first approximation, M-Lab allows 40 tests per day. The enforced limits are more complex. Learn what this means and how to work within them.
tags: [Internet Quality]
difficulty: beginner
---

**Q: How many M-Lab tests can I run per day?**

**A:** As a first approximation, plan for no more than 40 tests per day, which is the limit the [Acceptable Use Policy](/aup/) sets for interactive users. The limits M-Lab actually enforces are more complex: currently, 20 requests in a 30 minute sliding window based on both IP address and user-agent, and a 40 request limit in a 12 hour sliding window based on IP address alone.

For software or hardware integrations M-Lab recommends testing no more than 4 times per day for any one device / internet connection.

## Key Points

- The limits are enforced per source IP address, and per IP address plus user agent
- The IP-only limit covers all test types combined (not 40 per tool)
- The limits use sliding windows, so there is no daily reset, and rejected requests also count
- Exceeding this limit will result in test requests being rejected

## Need higher rate limits?

If you need to conduct measurements at a higher rate for legitimate research purposes, please contact M-Lab support at [support@measurementlab.net](mailto:support@measurementlab.net) to discuss your requirements. We may be able to accommodate special cases with proper justification.

## Alternative Approaches

- If you run tests from many devices, for example across a large organization, spread them across those devices and their exit IP addresses rather than running them all from one machine or one exit IP, and randomize test times as described in the [Developer Guide](/develop/). The per-device limit above still applies.
- Space out your measurements throughout the day
- Consider using M-Lab's historical datasets for analysis instead of running new tests

This rate limiting helps ensure the platform remains available and responsive for all users worldwide.
