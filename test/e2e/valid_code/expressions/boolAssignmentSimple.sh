a=2
b=0
c=$([ 1 -lt 2 ] && [ 5 -gt $a ] && [ $b -eq 0 ]; echo $?)