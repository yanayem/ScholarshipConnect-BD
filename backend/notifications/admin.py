from django.contrib import admin
from .models import Notification, Broadcast

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    readonly_fields = ('created_at',)

@admin.register(Broadcast)
class BroadcastAdmin(admin.ModelAdmin):
    list_display = ('title', 'sender', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'message', 'sender__username')
    readonly_fields = ('created_at',)
