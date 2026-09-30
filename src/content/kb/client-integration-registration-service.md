---
permalink: client-integration-registration-service
title: Client-Integration Registration Service (CIRS)
chapter: Tests
chapterOrder: 3
order: 7
status: published
description: What CIRS is, why M-Lab is introducing it, and how usage tiers, costs, and the pilot program work for integrators running tests above the standard rate limits.
tags: [Node Operations, Data Access]
difficulty: beginner
---

The Client-Integration Registration Service (CIRS, pronounced "cheers") is an upcoming M-Lab feature that will require integrators running tests above certain usage thresholds to register a client name and obtain an API key. It is currently in pilot with a limited number of partners and is expected to launch into production by the end of 2026.

## What CIRS Does

CIRS lets M-Lab manage platform usage more effectively by establishing usage thresholds and offering different levels of access based on an integrator's needs and testing activity. This supports fair use of the platform while maintaining its long-term sustainability and reliability for the broader community.

Registered integrators also get data insights specific to their own integration, rather than only the aggregate public dataset.

CIRS applies to integrators, organizations embedding M-Lab tests into an application, website, or device fleet, not to individual members of the public running one-off tests. See [Integrating M-Lab Tests into Your Application](/kb/integrating-mlab-tests) for background on what an integration is.

## Why Now

M-Lab was founded in 2009, and internet usage patterns have changed substantially since then. In 2024, M-Lab introduced a platform-wide limit of 40 tests per day per IP address to improve security and sustainability (see [FAQ: Test Rate Limits](/kb/test-rate-limits)). That limit applies uniformly to every user, and without a registration system there was no way to grant exceptions or offer usage tiers to integrators with legitimate higher-volume needs.

CIRS makes it possible to distinguish integrator traffic from general public traffic and set appropriate limits for each, without weakening the protections the 2024 rate limit put in place.

## Usage Tiers and Costs

| Tier | Who it's for | Cost |
|---|---|---|
| Unregistered | General public, individual users | Free |
| Registered nonprofit / research | Nonprofit organizations, research institutions | Discounted rates and/or in-kind contribution agreements |
| Registered commercial | Commercial integrators | Paid; preferential rates for early members and current sponsors |

The unregistered tier will continue to serve the general public at no cost — CIRS does not change how individual users run tests today. Commercial use of the platform above the standard thresholds will carry a cost, reflecting the ongoing investment M-Lab's global measurement infrastructure requires. M-Lab is an open-source nonprofit, and this gives commercial partners a way to contribute back to the platform they rely on.

## Joining the Pilot

M-Lab is currently piloting CIRS with a limited number of partners ahead of the end-of-2026 production launch. To be considered, email [support@measurementlab.net](mailto:support@measurementlab.net) with:

- A description of your use case: the intended application, whether the use is commercial, research-based, or otherwise, and the expected timeline or duration of the project
- The estimated number of devices you expect to test each day, and the anticipated testing frequency per device
- The estimated number of IP addresses you expect to test each day, and the anticipated testing frequency per IP address

## Further Reading

- [Integrating M-Lab Tests into Your Application](/kb/integrating-mlab-tests)
- [FAQ: Test Rate Limits](/kb/test-rate-limits)

