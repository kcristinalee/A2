


# CMSC471: A2
Group Members: Isabel Flynn, Christina Lee, Kamyavalli Mopidevi

Link to Github: https://github.com/kcristinalee/A2

Link to Public Webpage: https://kcristinalee.github.io/A2

Link to Demo: https://media-hosting.imagekit.io//2e7c09d3ab8b4f86/CMSC471A2Demo.mp4?Expires=1836491010&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=tvRA8wgbrs7GaZZ21Gg3SmYBfDPUfFV8K~i5W8hw5xIadeYl8TJCbGpWrFWudHfc8tXx~J5SL60eSYcW6Z5~UXLTyvtWLfZ0KSz~VsIGEGk1~w7Z1bJ-3oHMCs9M1X7Orw5vv8L3Dv9Y7d~Q7f1mPhXy5qDnBGewsDcaEXlyH12kZlgUNVaqVEtxtnyJ9s2KofsPKtnxptETUdpCQVKjwBGHmOts8OnSUy6phPYM9G~lDym8-TYPuZzZ-IBgY59QQXw7pRyqmabbrao2W~4sQItqqaSg~jnBteZq3MZ5QN-RyO-j0WrEAP14JWx7HrTTL3vWrJFkPI0yj0RS1mauKw__
</a>






## Introduction

In 2017, the United States experienced a historic year of weather disasters, including hurricanes, floods, and wildfires. The year was also marked by global warming, as the average surface air temperature was the second warmest on record. Therefore, we wanted to gain a deeper understanding of the climate conditions in 2017.

We decided to narrow down our data to just the East Coast states rather than the entire U.S. (the reasoning behind this will be explained later). This led us to make our data visualization titled, “Exploring Daily Weather Patterns in the East Coast (2017),” which contains weather measurements across all East Coast states during 2017. Our data is taken from the NOAA Daily Global Historical Climatology Network, which ensures that we have accurate and reliable weather readings to work with. The data we used has been filtered to ensure that stations with sparse or incomplete data are left out, which allows our graph to more accurately reflect the weather patterns.

For this analysis, we focused on specific variables: Average Temperature (°F), Maximum Temperature (°F), Minimum Temperature (°F), Precipitation (Rainfall in inches), Snowfall (inches), Snow Depth (inches), Average Wind Speed (mph) and Strongest Wind Gust (mph). These variables provide valuable insight into weather patterns across the different East Coast states, helping to identify trends or anomalies in temperature fluctuations and precipitation distributions throughout the year. By exploring this subset, we are able to gain a deeper understanding of the overall climate conditions in the East Coast during 2017.

## Implementation / Techniques 


### Dynamic Filters 
The dataset contains numerous attributes such as temperature, precipitation, wind speed, and more. Rather than limiting the analysis to just two of these variables, we chose to implement dynamic filters and dropdown menus, allowing users to interactively select which attributes they want displayed on the x and y axes, along with the month they wanted to see the data extracted from. This approach gives users flexibility in exploring different combinations of weather attributes and discovering relationships within the data. Since we have given users this high level of customization, the visualization can adapt to reflect each user’s unique interests in East Coast weather patterns.


### Highlighting & Annotation
Even though we filtered the data down to only the East Coast states, the dataset was still a bit larger than the datasets we worked with in class. It became challenging for users to read precise values directly from the axes. To address this issue, we incorporated hover-based interactions, such as highlighting and annotations. When a user hovers over a specific data point, a tooltip appears displaying the exact values for the selected x and y variables, as well as the state, date, and elevation (in meters) associated with that data point. This feature improves readability and ensures that important details are accessible without overwhelming the user with cluttered information on the graph.


### Colors & Legends
One of the critical factors affecting weather conditions is the location where the data was collected. Therefore, we had to make it easy to visually differentiate between each state displayed on the graph. Each state was assigned a distinct color to achieve this. This is another reason why we decided to filter our data because if we wanted to display all the data, there would have to be 48 different colors (for the 48 states the data was taken on). This would be visually overwhelming and detract from the elegance and clarity of the graph. This decision aligns with principles learned in class regarding the balance between information density and visual simplicity. By limiting the number of colors, the visualization remains clean while still conveying what state is being displayed. To make sure users know what color maps to each state, we created a legend on the right side of our graph to display this information.


### Size & Legends
Furthermore, another factor affecting weather conditions is the elevation. We decided to visually show elevation by the size of each data point. If a data point was taken at a relatively high elevation, it will have a relatively large circle compared to a data point that was taken at a lower elevation. Similarly, we added this to our legend so the users know that the size of the data points is based on elevation.
 
## Development Process

### Our First Approach
We all worked together in setting up the Github so we can collaboratively work on the project. Kamyavalli started the project by figuring out how to take the data from the CSV file and created a basic graph where the x-axis was Average Temperature (°F) and the y-axis was Precipitation (Rainfall in inches). She also implemented the hover over display which showed the exact values of the x and y axes, along with the date and state of the data point. 

Isabel then worked on dynamic dropdowns. She created two drop downs called X-Axis and Y-Axis where the user can pick from Average Temperature (°F), Maximum Temperature (°F), Minimum Temperature (°F), Precipitation (Rainfall in inches), Snowfall (inches), Snow Depth (inches), Average Wind Speed (mph), and Strongest Wind Gust (mph). Along with that, she created a dropdown called Month where the user can view a whole year’s worth of data or pick a specific month they would like to see the data points extracted from. She then added transitions so that when the points move when a dropdown is changed, it is visually appealing to the eye. She also determined she needed to change from using a drop down to select the region to instead check boxes, so that multiple regions could be displayed at once.

Next, Christina did some debugging. The hover over display was not working properly where it was not dynamically changing the information. For example, let’s say the y-axis is set to Strongest Wind Gust (mph). It would give you the exact value of the strongest wind gust in mph. However, if you were to change the y-axis to Snowfall (inches), it would still show the exact value of the strongest wind gust in mph. She was able to fix this problem as well as spruce up the graph by coloring the data points by region and adding a legend that showed what region each color corresponded to.

This is when we started to run into some challenges. We started to notice that the graph would take about five seconds to initially load and then another five seconds when you changed one of the dropdowns. In fact, sometimes the graph completely crashed. This made it extremely difficult to code and debug our work because we had to wait to see our progress, along with that, it made it hard to see our transitions.

### Our Second Approach
Isabel proposed that the reason for this was because we are using too much data and that we should filter out the data to just the East Coast states instead of using data from the entire U.S.. To fix this, Isabel created a program to filter the data down to just the East Coast states, which cut the data down from over 400,000 data points to just under 60,000. 

Kamyavalli initially implemented the state checkboxes for user selection, but they were arranged vertically, taking up too much space. Isabel assisted in restructuring them to appear horizontally. She worked on assigning unique colors to each state for the legend and the graph, but initially, the colors were not displaying correctly due to an incorrect function call.

Since some issues were run into while Kamyavalli was adding the legend and colors for the East Coast states, Isabel took over and was able to change the program to display only the data for the East Coast states instead of regions, and create the five columns to display the checkboxes of each state. She also assigned different colors to each state and made a legend on the right side of the graph for user ease.

Christina did some more debugging on the hover over display. The value in the hover over display was not matching to where the data point was displayed on the graph. For example, when you hovered over a data point it would say the Strongest Wind Gust (mph) was 31.98 but was nowhere near 31.98 on the y-axis even though Strongest Wind Gust (mph) was set as the y-axis. The problem was that the x and y axis were working with all the data and the data points were working with just the filtered data. So she fixed the code such that the axes worked for the filtered data.

We then decided that we wanted to show another attribute that affected weather patterns and visually show this by how big or small the data points were. We saw this in Lab 5-6 by having a variable called sizeVar. Christina implemented this feature so that data points with low elevations would have a smaller circle compared to data points with higher elevations. She then added this information to the legend.

### AI Usage
We used ChatGPT on the rigorous tasks of our project: abbreviating the states and creating the program to filter the data. We felt comfortable with asking ChatGPT for help on this portion of the project because the main takeaway of this project was to learn how to build a data visualization and implement the techniques we learned in class, not manually filtering and cleaning up the data.

### Time Spent
Overall, we would say that we spent around 20 hours developing our application: five hours on Dynamic Filters, four hours on the Highlighting & Annotation, two hours on manually filtering the data, four hours on Colors & Legends, one hour on Size & Legends, and the rest on the writeup, setting up the public webpage, and recording the demo. The aspects that took the most time were the hover over element and aligning the data points to more accurately reflect the data, because those were the most persistent issues.

## Conclusion

In conclusion, this project allowed us to apply several key concepts learned in class and lab while also challenging us to think critically about how to present and interact with large datasets. We utilized data visualization principles such as dynamic filtering, interactivity, and color coding to make our findings more accessible and engaging for users. This not only helped us showcase relationships within weather patterns but also pushed us to solve problems, like optimizing performance and ensuring the accuracy of hover-based interactions. Overall, this project was a valuable hands-on exercise in both technical and conceptual aspects of data analysis and visualization.

## References

"Daily Weather in the U.S., 2017." NOAA Daily Global Historical Climatology 
Network, 2017, weather.txt.
