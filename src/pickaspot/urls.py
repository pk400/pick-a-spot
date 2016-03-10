from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from app.views import *

urlpatterns = [
	url(r'^$', 				home, 			name='home'),
	url(r'^map/$', 			map, 			name='map'),
	url(r'^preferences/$', 	preferences, 	name='preferences'),
	url(r'^chat/', 			chat, 			name='chat'),
	url(r'^admin/', 		admin.site.urls),
	url(r'^accounts/', 		include('registration.backends.simple.urls')),
	#url(r'^accounts/', 		include('registration.backends.default.urls')),
] #+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

#if settings.DEBUG:
#	urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'views.custom_404'
handler500 = 'views.custom_500'