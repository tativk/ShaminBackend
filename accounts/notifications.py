from django.db.models import Exists, OuterRef
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from config.permissions import IsStaffUser
from .models import AdminNotification


class NotificationQuery(serializers.Serializer):
    before = serializers.IntegerField(min_value=1, required=False)
    unread = serializers.BooleanField(default=False)


class NotificationRead(serializers.Serializer):
    id = serializers.IntegerField(min_value=1, required=False)
    through = serializers.IntegerField(min_value=1, required=False)

    def validate(self, data):
        if len(data) != 1:
            raise serializers.ValidationError('شناسه اعلان یا آخرین اعلان را مشخص کنید.')
        return data


class AdminNotificationsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        query = NotificationQuery(data=request.query_params)
        query.is_valid(raise_exception=True)
        receipts = AdminNotification.read_by.through.objects.filter(adminnotification_id=OuterRef('pk'), user_id=request.user.pk)
        events = AdminNotification.objects.annotate(is_read=Exists(receipts))
        unread_count = events.filter(is_read=False).count()
        latest_id = events.values_list('pk', flat=True).first()
        if query.validated_data['unread']:
            events = events.filter(is_read=False)
        if 'before' in query.validated_data:
            events = events.filter(pk__lt=query.validated_data['before'])
        rows = list(events.values('id', 'kind', 'title', 'message', 'section', 'created_at', 'is_read')[:31])
        return Response({'results': rows[:30], 'next_before': rows[29]['id'] if len(rows) > 30 else None, 'unread_count': unread_count, 'latest_id': latest_id})

    def post(self, request):
        data = NotificationRead(data=request.data)
        data.is_valid(raise_exception=True)
        events = AdminNotification.objects.all()
        if 'id' in data.validated_data:
            events = events.filter(pk=data.validated_data['id'])
        else:
            events = events.filter(pk__lte=data.validated_data['through'])
        receipt = AdminNotification.read_by.through
        receipt.objects.bulk_create([
            receipt(adminnotification_id=pk, user_id=request.user.pk)
            for pk in events.exclude(read_by=request.user).values_list('pk', flat=True)
        ], ignore_conflicts=True, batch_size=500)
        return Response({'unread_count': AdminNotification.objects.exclude(read_by=request.user).count()})
