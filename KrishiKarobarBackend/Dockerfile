# Use an official lightweight Python image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies (needed for Pillow and build tools)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       libjpeg-dev \
       zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Expose the port Django will run on
EXPOSE 8000

# Run makemigrations, migrations, collect static files, create superuser, then start gunicorn
# Requires env vars: DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_PASSWORD, DJANGO_SUPERUSER_EMAIL (optional)
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    python create_superuser.py && \
    gunicorn backend.wsgi:application --bind 0.0.0.0:8000