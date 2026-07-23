library(dplyr)
library(readr)

data_folder <- "/Users/taravat/Desktop/QP/QP/Data/Pipeline-Pilot Data"

demographic_file <- "/Users/taravat/Desktop/QP/prolific_demographic_export_6a50fde3de0d28b2af07698e copy.csv"


# Read the Prolific demographic file
demographic_data <- read_csv(
  demographic_file,
  show_col_types = FALSE
)


# Get the real Prolific participant IDs
valid_ids <- demographic_data$`Participant id`


# Create the path to the workerids file
workerids_file <- file.path(
  data_folder,
  "pse-sandbox-workerids.csv"
)


# Read the workerids file
workerids_data <- read_csv(
  workerids_file,
  show_col_types = FALSE
)


# Keep only the rows belonging to real Prolific participants
valid_workerids_data <- filter(
  workerids_data,
  prolific_participant_id %in% valid_ids
)


# Extract the numeric worker IDs
valid_workerids <- unique(valid_workerids_data$workerid)


# Find all CSV files
csv_files <- list.files(
  path = data_folder,
  pattern = "\\.csv$",
  full.names = TRUE
)


# Filter every CSV and replace the original file
for (file in csv_files) {
  
  dat <- read_csv(
    file,
    show_col_types = FALSE
  )
  
  if ("workerid" %in% names(dat)) {
    
    dat <- filter(
      dat,
      workerid %in% valid_workerids
    )
    
    write_csv(
      dat,
      file
    )
  }
}

