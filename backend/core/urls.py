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

from django.views.generic.base import RedirectView
import os

def home(request):
    return JsonResponse({"message": "ScholarshipConnectBD API is running", "status": "success"})

urlpatterns = [
    path('', home), # Root URL
    path('favicon.ico', RedirectView.as_view(url='/static/admin/img/favicon.ico')),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/scholarships/', include('scholarships.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/ai/', include('ai_assistant.urls')),
    path('api/community/', include('community.urls')),
    path('api/payments/', include('payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
