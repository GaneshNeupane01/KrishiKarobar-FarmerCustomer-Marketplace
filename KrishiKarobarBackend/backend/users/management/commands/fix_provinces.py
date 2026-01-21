from django.core.management.base import BaseCommand
from backend.users.models import FarmerProfile, CustomerProfile

VALID_PROVINCES = [
    'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'
]

class Command(BaseCommand):
    help = 'Update all user profiles with invalid province values to Bagmati.'

    def handle(self, *args, **options):
        farmer_updated = FarmerProfile.objects.exclude(province__in=VALID_PROVINCES).update(province='Bagmati')
        customer_updated = CustomerProfile.objects.exclude(province__in=VALID_PROVINCES).update(province='Bagmati')
        self.stdout.write(self.style.SUCCESS(f'Updated {farmer_updated} FarmerProfile and {customer_updated} CustomerProfile records to Bagmati.')) 