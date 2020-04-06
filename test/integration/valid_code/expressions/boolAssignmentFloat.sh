a=9.2
b=$([ $(echo "$a < 10" | bc -l) -eq 1 ]; echo $?)
c=$([ $(echo "6.7 + 8 < 100" | bc -l) -eq 1 ]; echo $?)