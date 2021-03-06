#!/bin/bash

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
elif [ $1 == 'runserver' ]
then
  # Run server
  source install/bin/activate
  trap "echo Server shutting down...; exit 0" SIGINT
  cd src
  ./manage.py runserver ${2}
  deactivate
elif [ $1 == 'install' ]
then
  # Install PickASpot
  echo "Checking dependencies"
  let foundpip_=false
  pip -V > /dev/null
  if [ $? == 0 ]
  then
    foundpip_=true
    echo "pip installed!"
  else
      echo "pip not installed!"
  fi

  if [ foundpip_ == true ]
  then
    pip install virtualenv
  fi

  echo "Checking python packages"
  pip install -r requirements.txt
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
