#!/usr/bin/bash
# -*- coding: utf8 -*-

docker buildx build --platform linux/arm64,linux/amd64,linux/arm/v7 -t pan93412/ciscc-backend:1.0 --push .
