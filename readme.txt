Build Instructions

Open 'carousel.html' in Chrome, Firefox or Opera.


Details

This module is intended to be used "as is" in a page. To initiate it, simply add the line `<div class="carousel" data-carousel-user="_USER_ID" data-carousel-photoset="_PHOTOSET_ID"></div>` (filling in _USER_ID and _PHOTOSET_ID) to your code where you want the carousel to appear. 

This module is fully encapsulated and exposes nothing of itself to its outer scope. The possibility to do so is baked in, but is not used.

This module allows for multiple accordions on the same page without affecting each other. 


To Do:

- Add functionality to UI to allow for changing what photoset a carousel is pulling data from on the fly
    This could probably work by rerunning the internal piece of 'getImages()' after setting the user and photoset ids to their new values
    
- Allow for variable-width carousels -- currently they're optimized at a fixed size (defaulting to 800 X 500)
    Can work -- would need a resize event to trigger and change the 'left' values of the sliders
    
- Add titles of images or albums
    This data already exists in the data collected, it's just not utilized. Would need to build UI for it and add some lines to change the HTML of the current title
    
- Add link to Flickr
    Given that all these images come from Flickr, it makes sense that there could be a button to take the user to the flickr page if they so desire


Technologies Used

JavaScript
Font Awesome
JQuery 

No other extensions used.