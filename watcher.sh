#!/bin/bash

py3 -m http.server &

while true
do
	waitfile . || exit
	clear
	make
done
