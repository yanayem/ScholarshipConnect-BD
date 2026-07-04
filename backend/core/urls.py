"""
MASTER URL CONFIG: Root routing table for the backend.
- Routes to Admin, Accounts, Scholarships, Blog, Applications, and Notifications.
- Connected to: All individual app urls.py.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return JsonResponse({"message": "ScholarshipConnectBD API is running", "status": "success"})

urlpatterns = [
    path('', home), # Root URL
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/scholarships/', include('scholarships.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
