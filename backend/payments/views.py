from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer
import uuid

class CheckoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Placeholder for checkout logic
        return Response({'status': 'checkout_initiated'})

class StripePaymentIntentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'client_secret': 'pi_placeholder_secret'})

class BKashCreatePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'paymentID': 'TRX12345', 'bkashURL': 'https://bkash.com/pay'})

class BKashExecutePaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'status': 'success'})

class PaymentSuccessView(views.APIView):
    def get(self, request):
        return Response({'message': 'Payment successful'})

class PaymentFailView(views.APIView):
    def get(self, request):
        return Response({'message': 'Payment failed'})

class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')
