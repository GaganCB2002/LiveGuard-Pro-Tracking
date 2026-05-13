FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY part4_integration_config/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all parts
COPY part1_backend_core/ ./part1_backend_core/
COPY part2_ai_agent/ ./part2_ai_agent/
COPY part3_frontend_dashboard/ ./part3_frontend_dashboard/
COPY part4_integration_config/ ./part4_integration_config/

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 5000

# Run from integration point
CMD ["python", "part4_integration_config/main.py"]
