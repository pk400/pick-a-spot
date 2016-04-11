#!/bin/bash

# Clear screen
clear

# Show help display
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

# Run server
elif [ $1 == 'runserver' ]
	then virtualenv install

	source install/bin/activate

	trap "echo Server shutting down...; exit 0" SIGINT
	
	port=

	if [ $# == 2 ]
		then port=$2
	fi

	cd src

	./manage.py runserver $port 2> ../logs/server.log

	deactivate

# Install PickASpot
elif [ $1 == 'install' ]
	then virtualenv install

	source install/bin/activate

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

	pip install -r requirements.txt &>logs/install.log
	if [ $? == 0 ]
		then echo "$(pip freeze)" | while read line
		do
			echo $line | awk -F'==' '{ printf "%s-%s   ",$1,$2 }'
		done
		printf "\n\n%s\n\n" "[ Success ] Dependencies installed"
	else
		echo "[ Failure ] Dependencies were not installed. Please check logs/install.log for more details."
	fi
	
	deactivate
fi
