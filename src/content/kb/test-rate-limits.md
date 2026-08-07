---
permalink: test-rate-limits
title: "FAQ: Test Rate Limits"
chapter: Understanding Measurement
chapterOrder: 2
order: 3
status: published
description: M-Lab enforces 40 tests per day per IP address. Learn what this means and how to work within the limit.
tags: [internet-quality]
difficulty: beginner
---

**Q: How many M-Lab tests can I run per day?**

**A:** M-Lab implements a rate limit of **40 tests per day per IP address** to ensure fair access to the platform and prevent abuse. This limit applies across all M-Lab measurement tools (NDT, Wehe, etc.) and resets every 24 hours.

## Key Points

- The limit is enforced per source IP address
- It covers all test types combined (not 40 per tool)
- The counter resets daily
- Exceeding this limit will result in test requests being rejected

## For Research or Organizational Use

If you need to conduct measurements at a higher rate for legitimate research purposes, please contact M-Lab support to discuss your requirements. We may be able to accommodate special cases with proper justification.

## Alternative Approaches

- Distribute tests across multiple IP addresses if available
- Space out your measurements throughout the day
- Consider using M-Lab's historical datasets for analysis instead of running new tests

This rate limiting helps ensure the platform remains available and responsive for all users worldwide.
