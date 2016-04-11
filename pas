#!/bin/bash

# Clear screen
clear

# Run server
if [ $1 == 'help' ]
	then
	echo "How to run this script: ./pas [option]"
	echo ""
	echo "Options:"
	echo "    install"
	echo "        Setup virtual environment and downloads dependecies"
	echo ""
	echo "    runserver [port]"
	echo "        Runs the server with an option to use a port"
	echo ""
elif [ $1 == 'runserver' ]
	then port=

	if [ $# == 2 ]
		then port=$2
	fi

	cd src

	./manage.py runserver $port 2> ../logs/server.log

# Install PickASpot
elif [ $1 == 'install' ]
	then source installenv/bin/activate

	printf "\nPickASpot Installation Script"
	printf "\n-----------------------------\n"

	compos="$(uname -o)"
	pyver="$(python -V 2>&1 | awk '{print $2}')"

	printf "\nSystem Information"
	printf "\n%-25s%s" "Linux Distro:" "$compos"
	printf "\n%-25s%s" "Python Version:" "$pyver"
	printf "\n%-25s%s" "Virtual Environment:" "$VIRTUAL_ENV"
	printf "\n"

	printf "\n%s\n\n" "Installing dependencies . . ."

	sudo pip install -r requirements.txt &>logs/install.log
	if [ $? == 0 ]
		then echo "$(pip freeze)" | while read line
		do
			echo $line | awk -F'==' '{ printf "%s-%s   ",$1,$2 }'
		done
		printf "\n\n%s\n\n" "[ Success ] Dependencies installed"
	else
		echo "[ Failure ] Dependencies were not installed. Please check logs/install.log for more details."
	fi
fi
