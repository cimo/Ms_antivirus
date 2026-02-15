#!/bin/bash

p1=$(printf '%s' "${1}" | xargs)

if [ -z "${p1}" ]
then
    echo "command2.sh - Missing parameter."

    exit 1
fi

parameter1="${1}"

clamdscan "${parameter1}"
