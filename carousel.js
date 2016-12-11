// module pattern
var jsCarousel = (function() {

  var controls = {}; // this gets returned as the external facing object

  var carouselData = [],
      API_KEY = "9723a45f9ba434558f226a1fe5c55f3f";

  // self-initiate (but only after the page has loaded)
  window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);

    // On page load, run this initialization code (makes sure to wait for the rest of the page to load).
    // This is important so that we can run potentially blocking code after the UI gets added.

    buildCarousels();
    getImages(); // allows for changing the user and album. If this gets

    // send all events to one large dispatch function that then does what it needs to.
    // this way we don't have to worry about adding/removing listeners and loosing track of them
    document.addEventListener('mouseover', dispatch, false);
    document.addEventListener('click', dispatch, false);

    render(); // start the render process (triggers itself as often as it can)

  }, false);

  function buildCarousels() {
    // Finds ever carousel with a data-carousel-user attribute and a data-carousel-photoset attribute and fills in the guts

    // Each time we build carousels, make sure we clear everything
    // A better way would be to check to see if the already exists 
    // and only modify it if it's changed, but we're only planning
    // on running this once.

    carouselData = [];

    $('.carousel[data-carousel-user][data-carousel-photoset]').each(function(id, carousel) {


      var fragment = document.createDocumentFragment(), // build a container for the elements

          images_el = document.createElement("div"), // build an element for holding the images

          controls_el = document.createElement("div"), // build an element for holding the controls
          swapLeft_el = document.createElement("div"), // build the element triggers prev()
          iconLeft_el = document.createElement("i"), // build the arrow left icon

          swapRight_el = document.createElement("div"), // build the element triggers next()
          iconRight_el = document.createElement("i"), // build the arrow right icon

          each_el = document.createElement("div"); // build the element that holds indicators

      images_el.classList.add("images");

      // set classes and append childred to controls
      controls_el.classList.add("controls");

      swapLeft_el.classList.add("swap","left");

      iconLeft_el.classList.add("fa","fa-angle-left");

      swapRight_el.classList.add("swap","right");

      iconRight_el.classList.add("fa","fa-angle-right");

      each_el.classList.add("each");

      fragment.appendChild(images_el);

      fragment.appendChild(controls_el);

      controls_el.appendChild(swapLeft_el);
      swapLeft_el.appendChild(iconLeft_el);

      controls_el.appendChild(swapRight_el);
      swapRight_el.appendChild(iconRight_el);

      controls_el.appendChild(each_el);

      carousel.innerHTML = ""; //make sure we clear it so that the current guts don't mess up the carousel
      carousel.appendChild(fragment); // add all the guts we made

      // push the carousel data to an array we can track on
      carouselData.push({
        carousel: carousel,
        images: [],
        selected: 0,
        previous: 0,
        user: carousel.getAttribute("data-carousel-user"),
        photoset: carousel.getAttribute("data-carousel-photoset")
      });
    });

  }

  function getImages() {

    // Get the images for each carousel

    // Loop through carouselData, and for each carouselObj

    carouselData.forEach(function(carouselObj) {

      $.ajax(
        "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + encodeURI(API_KEY) + "&photoset_id=" + encodeURI(carouselObj.photoset) + "&user_id=" + encodeURI(carouselObj.user) + "&format=json&nojsoncallback=1&extras=url",
        {
          error: function (jqXHR, textStatus, errorThrown) {
            console.error(errorThrown); // whoohoo, some amazing error checking.
          },

          success: function (data, textStatus, jqXHR) {

            var images = [];

            // Build the urls for each image...
            data.photoset.photo.forEach(function(item) {
              images.push({
                url: 'https://farm' + item.farm + '.staticflickr.com/' + item.server + '/' + item.id + '_' + item.secret + '.jpg',
                url_b: 'https://farm' + item.farm + '.staticflickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_b.jpg',
              })
            });

            // Yay, fragments! Use them for less lag!
            var imageFrag = document.createDocumentFragment(),
                indicatorFrag = document.createDocumentFragment();

            images.forEach(function(image, index) {

              // Building a picture and source set just in case one of the urls doesn't come through
              var pictureEl = document.createElement('picture'),
                  sourceEl = document.createElement('source'),
                  imgEl = document.createElement('img'),

                  indicatorEl = document.createElement('i'); // build the indicator (a little circle)

              sourceEl.setAttribute("srcset",image.url_b);
              imgEl.setAttribute("src",image.url);

              indicatorEl.classList.add('fa','indicator'); // built my own font-awesome classes that change before on hover
              if (index === 0) indicatorEl.classList.add('selected');

              pictureEl.appendChild(sourceEl);
              pictureEl.appendChild(imgEl);

              imageFrag.appendChild(pictureEl);
              indicatorFrag.appendChild(indicatorEl);

              image.element = pictureEl;
              image.indicator = indicatorEl;
            }); 

            carouselObj.images = images; // set the temp variable to the carousel one.

            // Built everything? Okay, NOW we can add it.

            var imagePad = carouselObj.carousel.querySelector('.images');
            imagePad.innerHTML = "";
            imagePad.appendChild(imageFrag);

            var eachPad = carouselObj.carousel.querySelector('.each')
            eachPad.innerHTML = "";
            eachPad.appendChild(indicatorFrag);
          }
        }
      );

    });
  }

  function getCurrentCarousel(target) {
    var carousel = $(target).closest('.carousel')[0];

    return carouselData.find(function(object) {
      return carousel === object.carousel;
    })
  }

  function dispatch(event) {

    var carousel = $(event.target).parents('.carousel');

    if (carousel[0]) {
      if (event.type == 'click' || event.type == 'mousedown') {
        if ($(event.target).closest('.swap.right')[0]) {
          // If this or one of this element's ancestors are .swap.right
          next(event.target);
        } 

        else if ($(event.target).closest('.swap.left')[0]) {
          // If this or one of this element's ancestors are .swap.right
          prev(event.target);
        } 

        else if ($(event.target).is('.each .indicator')) {
          // Jump to clicked ancestor
          jump(event.target);
        }
      }
    }
  }

  // These are the functions that control movement (they send slide() some info)
  function next(target) {
    var carouselObj = getCurrentCarousel(target); // get the carousel
    slide(carouselObj.selected + 1, carouselObj); // call slide() of the next image index
  }
  function prev(target) {
    var carouselObj = getCurrentCarousel(target);
    slide(carouselObj.selected - 1, carouselObj); // call slide() of the next image index
  }
  function jump(target) {

    // Gets the index of the input element

    // Since I stored references to the indicator elements,
    // we can just find() through the 'images' array until we 
    // find one that has an .indicator property that matches the target
    // all the while setting the index to the current id.

    // This'll give us the index of the clicked indicator.

    var index = 0;

    var carouselObj = getCurrentCarousel(target);

    var finder = carouselObj.images.find(function(item, id) {
      index = id;
      return item.indicator == target;
    });

    // semi-useful error checking!
    if (finder) {
      slide(index, carouselObj);
    } 

    else {
      console.warn("The getIndicatorsIndex() function was called, but the input was not a registered indicator."); 
    }
  }

  // slide() takes an index and a carouselObj and moves the carousel the right direction
  function slide(index, carouselObj) {

    // Basically just sets the selected variable to the index and make sure it's not beyond the bounds of the images

    var length = carouselObj.images.length; // store a local version of the length

    if (index < 0) 
      index = (length) + index; 

    else if (index > (length - 1)) 
      index = (index - length); 

    carouselObj.selected = index; // note that it doesn't do the rendering -- it just sets the variable
  }

  // Rendering stuff (pretty simple for now)
  function render() {

    // does the rendering! Reruns every chance it gets and waits for the browser to be unblocked

    // Since it's possible to have multiple carousels on a give page, do it for each one involved
    carouselData.forEach(function(carouselObj) {

      if (carouselObj.selected != carouselObj.previous) {

        var slider = carouselObj.carousel.querySelector('.images'); // not easily extensible... would need to add some functionality to differentiate between two sliders for this to work properly.

        $(slider).stop();
        $(slider).animate({
          left: (carouselObj.selected * -carouselObj.carousel.offsetWidth) + 'px',
        });

        // de-select the current indicator
        // written this way to catch errors if multiple indicators are selected
        $(carouselObj.carousel).find('.indicator.selected').each(function(index, element) {
          element.classList.remove('selected');
        })

        carouselObj.images[carouselObj.selected].indicator.classList.add('selected');

        carouselObj.previous = carouselObj.selected;
      }

    });

    requestAnimationFrame(render); // calls render() the next time the browser isn't blocked with other rendering (usually ends up being ~60x per second)
  }

  return controls;
}());