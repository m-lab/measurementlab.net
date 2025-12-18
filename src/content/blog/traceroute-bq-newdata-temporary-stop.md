---
permalink: traceroute-bq-newdata-temporary-stop
title: Traceroute BigQuery Table New Data Temporarily Halted for Schema Change
authors:
  - ya-chang
published: published
tags:
  - data
  - data-analysis
  - community
categories:
  - News
publishedDate: 2019-06-26
---

M-Lab is working on replacing the [current traceroute BigQuery table](https://console.cloud.google.com/bigquery?project=measurement-lab&p=measurement-lab&d=aggregate&t=traceroute&page=table){:target="_blank"} with new schema, which will put all hops of one test in one row of BigQuery table. <!--more -->The new table will have all the information in the current table but make the search of hops within one test much easier. To make this happen, we will stop the new data feed of current traceroute BigQuery table in early July, 2019. The details of new schema will be published once the conversion of all data to BigQuery tables with the new traceroute schema is completed and available to the public.
