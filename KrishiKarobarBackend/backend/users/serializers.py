from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FarmerProfile, CustomerProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class FarmerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    join_date = serializers.DateTimeField(source='user.date_joined', format="%Y-%m-%d", read_only=True)
    # Distance from requesting user (in km) when location is provided
    distance = serializers.FloatField(read_only=True, required=False, allow_null=True)

    class Meta:
        model = FarmerProfile
        fields = [
            'user',
            'join_date',
            'phone',
            'province',
            'address',
            'latitude',
            'longitude',
            'farm_name',
            'farm_size',
            'farming_experience',
            'crop_types',
            'profile_picture',
            'distance',
        ]

class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    join_date       = serializers.DateTimeField(source='user.date_joined', format="%Y-%m-%d", read_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            'user',
            'join_date',
            'phone',
            'province',
            'address',
            'latitude',
            'longitude',
            'business_name',
            'business_type',
            'profile_picture'
        ]

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class RegisterSerializer(serializers.ModelSerializer):
    userType = serializers.ChoiceField(choices=[('farmer','farmer'),('customer','customer')], write_only=True)
    phone = serializers.CharField(write_only=True)
    province = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)
    latitude = serializers.FloatField(required=False, write_only=True)
    longitude = serializers.FloatField(required=False, write_only=True)
    # Farmer fields
    farm_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    farm_size = serializers.CharField(required=False, allow_blank=True, write_only=True)
    farming_experience = serializers.CharField(required=False, allow_blank=True, write_only=True)
    crop_types = serializers.CharField(required=False, allow_blank=True, write_only=True)
    # Customer fields
    business_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    business_type = serializers.CharField(required=False, allow_blank=True, write_only=True)
    # Shared
    profile_picture = serializers.ImageField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'username','email','password','first_name','last_name',
            'userType','phone','province','address','latitude','longitude',
            'farm_name','farm_size','farming_experience','crop_types',
            'business_name','business_type','profile_picture'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        userType = validated_data.pop('userType')
        phone = validated_data.pop('phone')
        province = validated_data.pop('province')
        address = validated_data.pop('address')
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)
        picture = validated_data.pop('profile_picture', None)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name',''),
            last_name=validated_data.get('last_name',''),
        )
        user.is_active = True  # User is active immediately
        user.save()

        if userType == 'farmer':
            FarmerProfile.objects.create(
                user=user,
                phone=phone,
                province=province,
                address=address,
                latitude=latitude,
                longitude=longitude,
                farm_name=validated_data.get('farm_name',''),
                farm_size=validated_data.get('farm_size',''),
                farming_experience=validated_data.get('farming_experience',''),
                crop_types=validated_data.get('crop_types',''),
                profile_picture=picture
            )
        else:
            CustomerProfile.objects.create(
                user=user,
                phone=phone,
                province=province,
                address=address,
                latitude=latitude,
                longitude=longitude,
                business_name=validated_data.get('business_name',''),
                business_type=validated_data.get('business_type',''),
                profile_picture=picture
            )

        return user