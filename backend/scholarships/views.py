from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from .models import Scholarship
from .serializers import ScholarshipSerializer

class ScholarshipListCreateView(generics.ListCreateAPIView):
    serializer_class = ScholarshipSerializer

    def get_queryset(self):
        user = self.request.user
        
        status_param = self.request.query_params.get('status')
        
        if user.is_authenticated and user.is_staff and status_param:
            queryset = Scholarship.objects.filter(status=status_param).order_by('-created_at')
        else:
            # Everyone (including staff by default) gets active scholarships
            queryset = Scholarship.objects.filter(status='active').order_by('-created_at')
        
        country = self.request.query_params.get('country')
        if country and country.lower() != 'all':
            queryset = queryset.filter(country__icontains=country)
            
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            queryset = queryset.filter(category__icontains=category)
            
        level = self.request.query_params.get('level')
        if level and level.lower() != 'all':
            queryset = queryset.filter(level__icontains=level)
            
        return queryset

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(submitted_by=user, status='pending')

class ScholarshipApproveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response({"error": "Staff access required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            scholarship = Scholarship.objects.get(pk=pk)
            action = request.data.get('action')
            
            if action == 'approve':
                scholarship.status = 'active'
            elif action == 'reject':
                scholarship.status = 'rejected'
            else:
                return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            
            scholarship.save()
            return Response({"message": f"Scholarship {action}d successfully"})
        except Scholarship.DoesNotExist:
            return Response({"error": "Scholarship not found"}, status=status.HTTP_404_NOT_FOUND)

class ScholarshipRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class BulkScholarshipUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        if not isinstance(request.data, list):
            return Response({"error": "Expected a list of scholarships"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ScholarshipSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EligibilityCheckView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

        from django.utils import timezone
        queryset = Scholarship.objects.filter(deadline__gte=timezone.now().date(), status='active')

        if profile.cgpa is not None:
            queryset = queryset.filter(models.Q(min_cgpa__lte=profile.cgpa) | models.Q(min_cgpa__isnull=True))

        if profile.academic_level:
            queryset = queryset.filter(level__icontains=profile.academic_level)

        serializer = ScholarshipSerializer(queryset, many=True)
        
        return Response({
            "user_info": {
                "cgpa": profile.cgpa,
                "academic_level": profile.academic_level
            },
            "matches": serializer.data,
            "count": queryset.count()
        })
