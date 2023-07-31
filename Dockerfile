FROM mysql:5.7.42

# Copy the dump.sql file into the image's initialization directory
COPY dump.sql /docker-entrypoint-initdb.d
