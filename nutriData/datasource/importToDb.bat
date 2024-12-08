@echo off
setlocal enabledelayedexpansion

:: Define the SQLite database file
set "DB_NAME=..\db.sqlite3"

:: Directory containing CSV files
set "CSV_DIR=.\Food_central"

:: Loop through all CSV files in the directory
for %%F in ("%CSV_DIR%\*.csv") do (
    :: Extract the table name from the file name (remove path and extension)
    set "csv_file=%%~fF"
    set "table_name=%%~nF"

    echo Processing file: !csv_file!
    echo Creating table: !table_name!


    :: Import the CSV file into the table
    sqlite3 "!DB_NAME!" ".mode csv" ".import !csv_file! !table_name!"
    if errorlevel 1 (
        echo Failed to import data from file: !csv_file!
        goto :end
    )

    echo Data from '!csv_file!' has been imported into table '!table_name!'.
)

:end
echo All CSV files have been processed.
pause

