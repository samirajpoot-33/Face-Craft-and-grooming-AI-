# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Install system dependencies for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 7860

# Run the application with Gunicorn
# Hugging Face Spaces expects the app on port 7860 by default
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]
