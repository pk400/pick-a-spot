### Pick A Spot
*Less thinking, more eating*

## About
Going to lunch with coworkers and don't want to spend precious lunch-time deciding where to eat? How about going out to the city with friends but no one can make up their minds on where to eat and you are starving? Don't you wish you could yell at them to simply *pick a spot*? Well now you can!

## Structure
\*`bin`, `include`, `lib`, and `local` are virtual environment folders, and are not related to the project at all.

### Root Directory
Item | Details
--------- | -------
[src](https://github.com/pk400/pick-a-spot/tree/master/src) | Main development directory
[static_cdn](https://github.com/pk400/pick-a-spot/tree/master/static_cdn) | Static items such as CSS, scripts, and images
[media_cdn](https://github.com/pk400/pick-a-spot/tree/master/media_cdn) | Items uploaded by users

### Main Development Directory
Item | Details
------|--------
[src/app](https://github.com/pk400/pick-a-spot/tree/master/src/app) | Root directory of the pickaspot web app
[src/pickaspot](https://github.com/pk400/pick-a-spot/tree/master/src/pickaspot) | Contains configurations for the site
[src/static](https://github.com/pk400/pick-a-spot/tree/master/src/static) | Static items such as CSS, scripts, and images
[src/templates](https://github.com/pk400/pick-a-spot/tree/master/src/templates) | Django templates
src/db.sqlite3 | Database for the site
manage.py | Django script with various commands to manage the site

## Installation & Starting Server
1. Pull repo.
2. Change directory to repo `cd pick-a-spot`.
3. Start virtual environment with `source bin/activate`.
4. Change directory to src `cd src`.
5. Run server `python manage.py runserver`.
6. Open browser to `http://localhost:8000`.
