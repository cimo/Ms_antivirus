#!/bin/bash

set -euo pipefail

service clamav-daemon restart
service clamav-daemon status
