import os

# DJANGO BASE SETTINGS
ALLOWED_HOSTS = ['*']
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEBUG = False
SECRET_KEY = os.environ['SECRET_KEY']

# Application definition
INSTALLED_APPS = [
    'registration',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
	'app',
    'channels',
    'lazysignup',
]

AUTHENTICATION_BACKENDS = (
  'django.contrib.auth.backends.ModelBackend',
  'lazysignup.backends.LazySignupBackend',
)

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'pickaspot.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.template.context_processors.static',                         
                'django.contrib.auth.context_processors.auth', 
                'django.contrib.messages.context_processors.messages',
                'pickaspot.context_processors.default',
            ],
        },
    },
]

WSGI_APPLICATION = 'pickaspot.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'EST'

USE_I18N = True

USE_L10N = True

USE_TZ = False

GEOIP_PATH = os.path.join(BASE_DIR, 'geoip')

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'static')
STATICFILES_DIRS = [  
    os.path.join(BASE_DIR,'static/'),
]

if DEBUG:
    MEDIA_URL = '/media/'
    STATIC_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'static')
    MEDIA_ROOT = os.path.join(BASE_DIR, "static", "media")
    STATICFILES_DIRS = [  
        os.path.join(BASE_DIR,'static/'),
    ]


#STATIC_URL = '/static_cdn/'
#STATICFILES_DIRS = [
#    os.path.join(BASE_DIR, 'static'),
#]

#STATIC_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'static')
#STATIC_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'static_cdn')
#MEDIA_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'media_cdn')

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    #'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

REGISTRATION_OPEN       = True                  # If True, users can register
ACCOUNT_ACTIVATION_DAYS = 7                     # One-week activation window; you may, of course, use a different value.
REGISTRATION_AUTO_LOGIN = False                 # If True, the user will be automatically logged in.
LOGIN_REDIRECT_URL      = '/'                # The page you want users to arrive at after they successful log in
LOGIN_URL               = '/accounts/login/'    # The page users are directed to if they are not logged in, and are trying to access pages requiring authentication

WEBSOCKET_URL           = '/ws/'
WS4REDIS_EXPIRE         = 7200
WS4REDIS_PREFIX         = 'spot'

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "asgi_redis.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("localhost", 6379)],
        },
        "ROUTING": "pickaspot.routing.channel_routing",
    },
}

SECURE_CONTENT_TYPE_NOSNIFF     = True
SECURE_BROWSER_XSS_FILTER       = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = '587'
EMAIL_HOST_USER = 'pickaspotmail@gmail.com'
EMAIL_HOST_PASSWORD = 'johncena4'
EMAIL_USE_TLS = True

SITE_ID = 1
