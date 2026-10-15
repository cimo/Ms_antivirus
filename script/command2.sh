#!/bin/bash

p1="${1}"

if [ "$#" -lt 1 ] || [ -z "${p1}" ]
then
    echo -e "\n❌ command2.sh - Missing parameter."

    exit 1
fi

parameter1="${p1}"

clamdscan "${parameter1}"
