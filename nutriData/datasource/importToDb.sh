#!/bin/bash

# Enable debugging for script errors
set -e
set -o pipefail

# Define the SQLite database file
DB_NAME="../db.sqlite3"

# Directory containing CSV files
CSV_DIR="./Food_central"

# Ensure the database and directory exist
if [[ ! -f "$DB_NAME" ]]; then
    echo "Database file '$DB_NAME' not found."
    exit 1
fi

if [[ ! -d "$CSV_DIR" ]]; then
    echo "CSV directory '$CSV_DIR' not found."
    exit 1
fi

# Loop through all CSV files in the directory
for csv_file in "$CSV_DIR"/*.csv; do
    # Extract the table name from the file name (remove path and extension)
    table_name=$(basename "$csv_file" .csv)

    echo "Processing file: $csv_file"
    echo "Creating table: $table_name"

    # Import the CSV file into the table
    sqlite3 "$DB_NAME" <<EOF
.mode csv
.import $csv_file $table_name
EOF

    if [[ $? -ne 0 ]]; then
        echo "Failed to import data from file: $csv_file"
        exit 1
    fi

    echo "Data from '$csv_file' has been imported into table '$table_name'."
done

echo "All CSV files have been processed."

