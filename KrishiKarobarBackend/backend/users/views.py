from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import RegisterSerializer, LoginSerializer, FarmerProfileSerializer, CustomerProfileSerializer
from django.contrib.auth import authenticate

from rest_framework.authtoken.models import Token

from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import FarmerProfile, CustomerProfile
from .serializers import FarmerProfileSerializer
## Email verification imports removed
from django.contrib.auth.models import User

class RegisterView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        print("Registration request received:", request.data)
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Get user type from request data
            user_type = request.data.get('userType', 'farmer')
            print("Registration successful for user:", user.username, "Type:", user_type)
            return Response({
                'detail': 'Registration successful.',
                'userType': user_type
            }, status=status.HTTP_201_CREATED)
        print("Registration validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    """
    POST { username, password } → { token: "<your‑token‑here>", userType: "farmer/customer" }
    """
    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        if not user:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=user)
        
        # Determine user type
        try:
            user.farmerprofile
            user_type = 'farmer'
        except:
            user_type = 'customer'

        return Response({
            'token': token.key,
            'userType': user_type
        })





from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import FarmerProfile, CustomerProfile



class ProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        try:
            # Try to get farmer profile first
            farmerprofile = FarmerProfile.objects.get(user=request.user)
            serializer = FarmerProfileSerializer(farmerprofile)
            return Response({
                'userType': 'farmer',
                'profile': serializer.data
            })
        except FarmerProfile.DoesNotExist:
            try:
                # If not farmer, try customer profile
                customerprofile = CustomerProfile.objects.get(user=request.user)
                serializer = CustomerProfileSerializer(customerprofile)
                return Response({
                    'userType': 'customer',
                    'profile': serializer.data
                })
            except CustomerProfile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=404)

    def put(self, request):
        try:
            # Try to get farmer profile first
            farmerprofile = FarmerProfile.objects.get(user=request.user)
            serializer = FarmerProfileSerializer(farmerprofile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'userType': 'farmer',
                    'profile': serializer.data
                })
            return Response(serializer.errors, status=400)
        except FarmerProfile.DoesNotExist:
            try:
                # If not farmer, try customer profile
                customerprofile = CustomerProfile.objects.get(user=request.user)
                serializer = CustomerProfileSerializer(customerprofile, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response({
                        'userType': 'customer',
                        'profile': serializer.data
                    })
                return Response(serializer.errors, status=400)
            except CustomerProfile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Determine user type and redirect
        user_type = 'customer'
        if hasattr(user, 'farmerprofile'):
            user_type = 'farmer'
        return Response({
            'message': 'Registration successful!',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'userType': user_type
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            # Determine user type
            user_type = 'customer'  # default
            if hasattr(user, 'farmerprofile'):
                user_type = 'farmer'
            return Response({
                'token': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'userType': user_type
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    """
    Verify email with token
    """
    # Email verification logic removed
    
    if success:
        return Response({
            'message': message,
            'verified': True
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'message': message,
            'verified': False
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification(request):
    """
    Resend verification email
    """
    user = request.user
    
    # Check if already verified
    try:
        if user.email_verification.is_verified:
            return Response({
                'message': 'Email is already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
    except:
        pass
    
    # Resend verification email
    # Email verification logic removed
    
    if success:
        return Response({
            'message': 'Verification email sent successfully!'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'message': 'Failed to send verification email. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    
    # Check if user has email verification
    is_email_verified = False
    try:
        is_email_verified = user.email_verification.is_verified
    except:
        pass
    
    if hasattr(user, 'farmerprofile'):
        serializer = FarmerProfileSerializer(user.farmerprofile)
        user_type = 'farmer'
    elif hasattr(user, 'customerprofile'):
        serializer = CustomerProfileSerializer(user.customerprofile)
        user_type = 'customer'
    else:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    profile_data = serializer.data
    profile_data['user']['is_email_verified'] = is_email_verified
    profile_data['userType'] = user_type
    
    return Response(profile_data)

from math import radians, cos, sin, asin, sqrt

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    lon1, lat1, lon2, lat2 = map(float, [lon1, lat1, lon2, lat2])
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

@api_view(['GET'])
@permission_classes([AllowAny])
def farmer_list(request):
    """
    Get list of farmers with distance calculation
    Query params: lat, lon (optional)
    """
    user_lat = request.GET.get('lat')
    user_lon = request.GET.get('lon')

    # Base queryset: all farmers ordered by most recently joined
    farmers_qs = FarmerProfile.objects.select_related('user').order_by('-user__date_joined')
    farmers = list(farmers_qs)

    # Optionally compute distance (in km) if user location is provided
    if user_lat and user_lon:
        for farmer in farmers:
            if farmer.latitude is not None and farmer.longitude is not None:
                try:
                    farmer.distance = haversine(user_lon, user_lat, farmer.longitude, farmer.latitude)
                except (TypeError, ValueError):
                    farmer.distance = None
            else:
                farmer.distance = None
    else:
        for farmer in farmers:
            farmer.distance = None

    serializer = FarmerProfileSerializer(farmers, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_stats(request):
    """Return aggregate counts of farmers and customers for homepage stats."""
    farmer_count = FarmerProfile.objects.count()
    customer_count = CustomerProfile.objects.count()
    return Response({
        'farmers': farmer_count,
        'customers': customer_count,
    })
