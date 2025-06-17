#!/bin/sh

# This script runs on container startup.
# It finds the main JavaScript file and replaces a placeholder
# with the actual API_URL environment variable.

# Find the main-*.js file
MAIN_JS=$(find /usr/share/nginx/html -name "main-*.js")

# Substitute the placeholder with the real value
# Important: Use a unique placeholder like ##API_URL## in your Angular code
envsubst '$API_URL' < $MAIN_JS > ${MAIN_JS}.tmp && mv ${MAIN_JS}.tmp $MAIN_JS

# Now, execute the original command that was in the Dockerfile's CMD
exec "$@"