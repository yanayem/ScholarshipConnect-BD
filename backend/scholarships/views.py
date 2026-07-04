from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from .models import Scholarship
from .serializers import ScholarshipSerializer

class ScholarshipListCreateView(generics.ListCreateAPIView):
    serializer_class = ScholarshipSerializer

    def get_queryset(self):
        # Regular users only see active ones
        if self.request.user.is_staff:
            queryset = Scholarship.objects.all().order_by('-created_at')
        else:
            queryset = Scholarship.objects.filter(status='active').order_by('-created_at')
        
        # Filtering
        country = self.request.query_params.get('country')
        category = self.request.query_params.get('category')
        level = self.request.query_params.get('level')
        is_featured = self.request.query_params.get('is_featured')
        status_param = self.request.query_params.get('status')

        if country:
            queryset = queryset.filter(country__icontains=country)
        if category:
            queryset = queryset.filter(category__icontains=category)
        if level:
            queryset = queryset.filter(level__icontains=level)
        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        if status_param and self.request.user.is_staff:
            queryset = queryset.filter(status=status_param)
            
        return queryset

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # If user is admin, make it active immediately. Otherwise, pending.
        status = 'active' if self.request.user.is_staff else 'pending'
        serializer.save(submitted_by=self.request.user, status=status)

class ScholarshipApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            scholarship = Scholarship.objects.get(pk=pk)
            action = request.data.get('action') # 'approve' or 'reject'
            
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

        # Base queryset: only upcoming scholarships
        from django.utils import timezone
        queryset = Scholarship.objects.filter(deadline__gte=timezone.now().date())

        # Match CGPA (User CGPA must be >= Scholarship min_cgpa)
        if profile.cgpa is not None:
            queryset = queryset.filter(models.Q(min_cgpa__lte=profile.cgpa) | models.Q(min_cgpa__isnull=True))

        # Match Academic Level (e.g. if user is at Bachelors, they look for Masters scholarships)
        # Or more simply, match the level exactly if that's how it's mapped.
        # Let's do a case-insensitive match for level.
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
