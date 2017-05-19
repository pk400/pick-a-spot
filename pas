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
	then
	virtualenv install

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
	then
		checkpackage() {
			local toinstall_=

			for i in $@
			do
				printf "\t $i\t"
				dpkg-query -L $i > /dev/null 2>&1

				if [ $1 == 1 ]
				then
						printf "[NOT FOUND]\n"
						toinstall_=("${toinstall_[@]}" "$i")
				else
						printf "[FOUND]\n"
				fi
			done

			for k in "${toinstall_[@]}"
			do
					printf "$k"
			done
		}
		# Check if virtualenv is installed
		printf "Checking packages ...\n"
		checkpackage virtualenv python-pip


		# Check if python-pip is installed
elif [ $1 == 'dumpdata' ]
	then
	cd src
	mkdir dumps
	
	./manage.py dumpdata auth.User --indent 4 > dumps/users.json
	./manage.py dumpdata auth.Group --indent 4 > dumps/groups.json
	./manage.py dumpdata app.friend --indent 4 > dumps/friends.json
	./manage.py dumpdata app.userprofile --indent 4 > dumps/userprofiles.json
elif [ $1 == 'droptables' ]
	then
	cd src
	
	./manage.py flush 
	./manage.py sqlflush

	sqlite3 db.sqlite3 "DELETE FROM sqlite_sequence"
elif [ $1 == 'loadtables' ]
	then
	cd src

	./manage.py loaddata dumps/groups.json
	./manage.py loaddata dumps/users.json
	./manage.py loaddata dumps/friends.json
	./manage.py loaddata dumps/userprofiles.json
fi
