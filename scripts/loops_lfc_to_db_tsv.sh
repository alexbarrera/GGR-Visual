#!/usr/bin/env bash

tail -n+2 $1 |\
 awk -v OFS="\t" \
 'BEGIN{print "anchor1_chr", "anchor1_start", "anchor1_end", "anchor2_chr", "anchor2_start", "anchor2_end","1", "4", "8", "12"}{split($1, a, "_"); for (i=1; i<=length(a); i++){printf "%s\t", a[i]}; printf "%.5f\t%.5f\t%.5f\t%.5f\n", $2, $3, $4, $5}'
