#Installing and calling necessary packages
install.packages("tidyverse")
library(tidyverse)

#Reading the merged file 
data_raw <- read_csv(
  "/Users/taravat/Desktop/QP/QP/Data/Pipeline-Pilot Data/pse-sandbox-merged.csv"
)

#selecting only the variables needed for Figure 1
figure1_data <- data_raw %>%
  select(
    workerid,
    verb,
    response
  )

#Making sure our data is numeric 
figure1_data <- figure1_data %>%
  mutate(
    response = as.numeric(response)
  )

#Removing missing responses
figure1_data <- figure1_data %>%
  filter(
    !is.na(response),
    !is.na(verb),
    !is.na(workerid)
  )

#Changing the verb inform_Sam to inform 
figure1_data <- figure1_data %>%
  mutate(
    verb = recode(
      verb,
      "inform_Sam" = "inform"
    )
  )

#Categorizing based on the type of factivity to control the colors and shapes in the figures
figure1_data <- figure1_data %>%
  mutate(
    predicate_type = case_when(
      
      verb == "control" ~
        "Control",
      
      verb %in% c(
        "think",
        "suggest",
        "say"
      ) ~
        "Nonfactive",
      
      verb %in% c(
        "prove",
        "confirm",
        "establish",
        "acknowledge",
        "hear",
        "inform"
      ) ~
        "Optionally factive",
      
      verb %in% c(
        "discover",
        "know",
        "reveal"
      ) ~
        "Canonically factive",
      
      TRUE ~ NA_character_
    )
  )

#For average responses within participant by predicate
participant_predicate_data <- figure1_data %>%
  group_by(
    workerid,
    verb,
    predicate_type
  ) %>%
  summarise(
    participant_rating = mean(
      response,
      na.rm = TRUE
    ),
    .groups = "drop"
  )

#Calculating the mean for each predicate
predicate_summary <- participant_predicate_data %>%
  group_by(
    verb,
    predicate_type
  ) %>%
  summarise(
    mean_certainty = mean(
      participant_rating,
      na.rm = TRUE
    ),
    number_of_participants = n(),
    .groups = "drop"
  )

#Creating a function to calculate a 95% bootstrapped confidence interval
bootstrap_mean_ci <- function(
    values,
    number_of_bootstraps = 5000
) {
  
  #Removing missing values
  values <- values[!is.na(values)]
  
  #Creating 5000 bootstrap means
  bootstrap_means <- replicate(
    number_of_bootstraps,
    mean(
      sample(
        values,
        size = length(values),
        replace = TRUE
      )
    )
  )
  
  #Returning the lower and upper limits of the confidence interval
  tibble(
    lower_ci = quantile(
      bootstrap_means,
      probs = 0.025
    ),
    
    upper_ci = quantile(
      bootstrap_means,
      probs = 0.975
    )
  )
}

#Making the bootstrap results reproducible
set.seed(2026)

#Calculating bootstrap confidence intervals for each predicate
predicate_bootstrap_ci <- participant_predicate_data %>%
  group_by(
    verb,
    predicate_type
  ) %>%
  group_modify(
    ~ bootstrap_mean_ci(
      .x$participant_rating,
      number_of_bootstraps = 5000
    )
  ) %>%
  ungroup()

#Combining predicate means and bootstrap confidence intervals
predicate_summary <- predicate_summary %>%
  left_join(
    predicate_bootstrap_ci,
    by = c(
      "verb",
      "predicate_type"
    )
  )

#Ordering predicates from lowest to highest mean certainty
predicate_order <- predicate_summary %>%
  arrange(mean_certainty) %>%
  pull(verb) %>%
  as.character()

#Applying the order to both plotting datasets
participant_predicate_data <- participant_predicate_data %>%
  mutate(
    verb = factor(
      as.character(verb),
      levels = predicate_order,
      ordered = TRUE
    )
  )

predicate_summary <- predicate_summary %>%
  mutate(
    verb = factor(
      as.character(verb),
      levels = predicate_order,
      ordered = TRUE
    )
  )

#Ordering predicates from lowest to highest mean certainty
predicate_order <- predicate_summary %>%
  arrange(
    mean_certainty
  ) %>%
  pull(
    verb
  ) %>%
  as.character()

#Applying the predicate order to the participant-level data
participant_predicate_data <- participant_predicate_data %>%
  mutate(
    verb = factor(
      as.character(verb),
      levels = predicate_order
    )
  )

#Applying the same predicate order to the summary data
predicate_summary <- predicate_summary %>%
  mutate(
    verb = factor(
      as.character(verb),
      levels = predicate_order
    )
  )

#Checking that the order is correct
levels(
  participant_predicate_data$verb
)

#Creating Figure 1
figure1 <- ggplot(
  participant_predicate_data,
  aes(
    x = verb,
    y = participant_rating
  )
) +
  
  #Showing the distribution of participant-level ratings
  geom_violin(
    aes(
      group = verb
    ),
    fill = "white",
    color = "grey80",
    linewidth = 0.6,
    width = 0.85,
    scale = "width",
    trim = FALSE
  ) +
  
  #Showing 95% bootstrapped confidence intervals
  geom_errorbar(
    data = predicate_summary,
    aes(
      x = verb,
      ymin = lower_ci,
      ymax = upper_ci
    ),
    inherit.aes = FALSE,
    color = "black",
    width = 0.10,
    linewidth = 0.7
  ) +
  
  #Showing predicate means
  geom_point(
    data = predicate_summary,
    aes(
      x = verb,
      y = mean_certainty,
      color = predicate_type,
      shape = predicate_type
    ),
    inherit.aes = FALSE,
    size = 3
  ) +
  
  #Matching colors to predicate categories
  scale_color_manual(
    values = c(
      "Control" = "black",
      "Nonfactive" = "grey55",
      "Optionally factive" = "#F15A3A",
      "Canonically factive" = "#9C39C6"
    ),
    breaks = c(
      "Control",
      "Nonfactive",
      "Optionally factive",
      "Canonically factive"
    ),
    labels = c(
      "Control" = "main clause controls",
      "Nonfactive" = "nonfactive",
      "Optionally factive" = "optionally factive",
      "Canonically factive" = "factive"
    )
  ) +
  
  #Matching shapes to predicate categories
  scale_shape_manual(
    values = c(
      "Control" = 16,
      "Nonfactive" = 15,
      "Optionally factive" = 17,
      "Canonically factive" = 18
    ),
    breaks = c(
      "Control",
      "Nonfactive",
      "Optionally factive",
      "Canonically factive"
    ),
    labels = c(
      "Control" = "main clause controls",
      "Nonfactive" = "nonfactive",
      "Optionally factive" = "optionally factive",
      "Canonically factive" = "factive"
    )
  ) +
  
  #Displaying control as MC on the x-axis
  scale_x_discrete(
    limits = predicate_order,
    labels = function(x) {
      ifelse(
        x == "control",
        "MC",
        x
      )
    }
  ) +
  
  #Showing ticks from 0 to 1
  scale_y_continuous(
    breaks = seq(
      0,
      1,
      by = 0.2
    ),
    expand = expansion(
      mult = c(0.01, 0.03)
    )
  ) +
  
  #Displaying only the response range without deleting violin coordinates
  coord_cartesian(
    ylim = c(0, 1)
  ) +
  
  #Adding axis and legend labels
  labs(
    x = "Predicate",
    y = "Mean certainty rating",
    color = "Predicate type",
    shape = "Predicate type"
  ) +
  
  #Using a style closer to the published figure
  theme_classic() +
  
  theme(
    axis.text.x = element_text(
      angle = 50,
      hjust = 1,
      vjust = 1
    ),
    
    legend.position = "bottom",
    
    panel.border = element_rect(
      color = "black",
      fill = NA,
      linewidth = 0.6
    )
  ) +
  
  guides(
    color = guide_legend(
      title.position = "left",
      nrow = 1
    ),
    
    shape = guide_legend(
      title.position = "left",
      nrow = 1
    )
  )

#Displaying Figure 1
figure1
