#!/bin/bash
echo "date,court,division,count" > data/stats.csv
# grab the columns we want
cat data/decisions.csv | tail -n +2 | cut --delimiter=, --fields=1,2,5 | \
# now normalize months so everything is xxxx-xx-01
  sed 's/..$/01/' | \
# now do group by with count
  sort | uniq -c | sort -n -r | \
# now fix up so we have CSV again
  sed 's/^\s*//g' | sed 's/ /,/g' | \
# move count to last col and date to first col
  awk -F , '{print $4 "," $2 "," $3 "," $1 }' \
  >> data/stats.csv

head -n 1 data/stats.csv > data/stats-ewca-civ.csv
grep EWCA,Civ data/stats.csv | sort -t, -k4 >> data/stats-ewca-civ.csv
