from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
import app.views

urlpatterns = [
	url(r'^$', app.views.home, name='home'),
	url(r'^browse/$', app.views.browse, name='browse'),
	url(r'^map/$', app.views.map, name='map'),
	#url(r'^login/$', app.views.login, name='login'),
	#url(r'^register/$', app.views.register, name='register'),
	url(r'^admin/', admin.site.urls),
	url(r'^accounts/', include('registration.backends.simple.urls'))
]

if settings.DEBUG:
	urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'views.custom_404'
handler500 = 'views.custom_500'