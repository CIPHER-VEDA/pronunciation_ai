import os
import logging
from flask import Flask, render_template

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the Flask application
web_app = Flask(__name__)
web_app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key-for-development")

@web_app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')

if __name__ == '__main__':
    web_app.run(host='0.0.0.0', port=5000, debug=True)
