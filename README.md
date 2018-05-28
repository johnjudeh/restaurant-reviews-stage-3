# Mobile Web Specialist Course - Google Scholarship
## Restaurant Reviews App
---

### Getting Started

If you want to take a closer look at the code, then follow the steps
below:

1. Clone the repository using `git clone https://github.com/johnjudeh/restaurant-reviews-stage-1.git`

2. Grab a free Google Maps Javascript API key from the
[Google API Console](https://console.developers.google.com/apis/). You will need
to put this key in place of the `YOUR_API_KEY` in the Google Maps script in both
HTML documents

3. In the app folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.  
In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000`. For Python 3.x, you can use `python -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software

4. With your server running, visit the site: `http://localhost:8000`

### Stage 1

#### Project Summary

At the beginning of this project, I was given a static version of the **Restaurant
Reviews App** website. It lacked a few important features which needed to be implemented:

1. Responsive design for all viewport sizes
2. Accessible features for users with impairments
3. Ability to show previously visited pages offline

#### 1. Responsive Design

The first task was revamping the style to create a responsive app across any device.
This was done purely using HTML and CSS without any external frameworks. To achieve
this I:

- Added the appropriate viewport `meta` tag in the HTML documents
- Began designing at the smallest viewport size (~300px wide) I wanted to support
- Used major and minor breakpoints, as well as flex box, to incrementally support
  larger viewport sizes
- Created four sizes for each image using Grunt
- Added `srcset` and `sizes` attributes to each image to allow the browser to select
  the most appropriate size for the viewport and device pixel ratio

#### 2. Accessibility

I then went on to implement user accessibility, following the guidelines contained
in the [Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG20/). This
involved:

- Ensuring all HTML elements were chosen based on their natural semantics
- Adding `alt` attributes to each image
- Adding aria attributes were HTML alone did not properly convey semantics (e.g.
  Google maps)
- Adding a skip link so users can easily jump over the map controls

#### 3. Offline Access

The third component of the project was ensuring that users could access any
previously visited pages offline. This was achieved by using **Service Worker API**
and the **Cache Interface**. The tasks achieved were:

- Registering the service worker if the browser supports it
- Caching static assets on registration
- Proxying network requests to serve cached asset where possible and caching any
  new responses for the user's next visit
- Listening for new service workers and notifying the user when the new worker
  was waiting. This was achieved using a toast message
- Allowing the service worker to skip waiting if instructed by the user
