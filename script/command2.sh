#!/bin/bash

clamdscan "${1}" 2>&1 | tee -a "${PATH_ROOT}${MS_A_PATH_LOG}debug.log"
