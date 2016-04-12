from django.conf.urls import patterns, url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from app.views import *

urlpatterns = [
	#url(r'^$', 				home),
	#url(r'^splash/', 		splash),
	url(r'^$', 				splash),
	url(r'^home$', 			home),
	url(r'^map/$', 			map),
	url(r'^preferences/$', 	preferences),
	url(r'^friends/', 		friends),
	url(r'^resetpassword/', 		resetpassword),
	url(r'^confirmreset/', 		confirmreset),
	#url(r'^admin/',			adminredirect),
	url(r'^admin/', 		admin.site.urls),
	#url(r'^accounts/', 		include('registration.backends.simple.urls')),
	url(r'^accounts/', 		include('registration.backends.default.urls')),
	url(r'^profile/', 		profile),
	url(r'^convert/', 		include('lazysignup.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = 'views.custom_404'
handler500 = 'views.custom_500'