# Mobile Web Specialist Course - Google Scholarship
## Restaurant Reviews App
---

This is a three part project as part of Udacity's [Mobile Web Specialist Nanodegree](https://www.udacity.com/course/mobile-web-specialist-nanodegree--nd024).
This repo is the third and final part of the project but each stage is documented
in this README.md

### Getting Started

If you want to take a closer look at the code, follow the steps below:

In a terminal, clone the repository and change the working directory to the project
folder
```
git clone https://github.com/johnjudeh/restaurant-reviews-stage-3.git
cd restaurant-reviews-stage-3/
```

Install all of the project dependencies using npm. You will need both node.js and
npm already installed on your computer
```
npm install
```

Grab a Google Maps Javascript API key from the
[Google API Console](https://console.developers.google.com/apis/). You will need
to put this key in place of the `YOUR_GOOGLE_MAPS_API_KEY` in the `src` attributes
of the Google Maps scripts in the index.html and restaurant.html documents

Once you have put your API key into the HTML documents, you will need to rebuild the code
and move to the build folder. Type the following code into the terminal
```
gulp build
cd build/
```

Start up a simple HTTP server to serve up the site files on your local computer. Python
has some simple tools to do this. If you don't have Python installed, navigate to
[Python's website](https://www.python.org/) to download and install the software.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x,
spin up the server with `python -m SimpleHTTPServer 3000`. For Python 3.x, you can use
`python -m http.server 3000`.

Now we have our assets being served over the python server. However the website
interacts with a pre-built back-end server to retrieve restaurant data. You will
also need to download this server and run it on your local computer for the site
to work. You can find details of how to do this in the [server's Github repo](https://github.com/udacity/mws-restaurant-stage-3).

With both servers running on your computer, visit the site at: `http://localhost:3000`
and enjoy!

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

### Stage 2

#### Project Summary

In the previous stage of the project, the data served for the app was available
in a local JSON file. For this stage I was asked to change the source of the data
to a server running locally on my computer and optimise the app's performance in
Lighthouse audit in Chrome DevTools. The goals were:

1. Pull the site data from a server using Asynchronous JavaScript requests
2. Store the data into an IndexedDB database to allow the site to function offline
3. Optimise the code using tools such as Gulp to ensure it meets certain benchmarks
in the Lighthouse audit

#### 1. Servers and Asynchronous JavaScript

The server being used is available to be cloned from
`https://github.com/udacity/mws-restaurant-stage-2.git`. This was created by Udacity
instructors and is only being used to simulate having a back-end in the app. To
create the asynchronous request I used the Fetch API and its promise interface.

#### 2. Storing and Serving Assets from an IndexedDB Database

To avoid using the IndexedDB Requests in favour of ES6 promises, I used a small
library called [IndexedDB Promised](https://github.com/jakearchibald/idb). This
library mirrors IndexedDB but replaces IDBRequests with promises. The tasks
performed in this part of the project were:

- Creating an IndexedDB database on the app to store restaurant data
- Ensuring that any data fetched from the server is stored in the database
- Serving any data requested by the user agent from the database if it is available

#### 3. Optimising the Web App

To achieve the best user experience, I used Gulp to create a build process that
helps improve my productivity and the site's performance. The tasks performed were:

- Live editing with file changes being automatically rebuilt and the browser automatically
reloading
- Images compressed using lossless compression for production
- CSS autoprefixed and minified
- JS scripts transpiled through babel (ES6 --> ES5), browserifyed and minified

### Stage 3

#### Project Summary

The aim of this third and final stage is to improve the user experience in a
number of different ways. The main implementations were:

1. Adding favourite restaurant functionality and the ability to write reviews
2. Using the Service Worker API's background sync features to allow users to
favourite restaurants and write reviews while offline
3. Achieving a Google DevTools Audit score of >90 in Performance, PWA
and Accessibility

#### 1. Favourite Restaurants & Reviews

The favouriting restaurants functionality was added on both HTML documents as a Star
toggle button. On being clicked, it sends a PUT request to the server and stores
the response in the IDB database. The button adheres to ARIA accessibility guidelines.

The reviews functionality was created using a form. Once submitted a POST request is
sent to the server with a JSON body. The response received is added to the IDB database.

#### 2. Background Sync

Any visited page is already being cached by the service worker and the data within it
is being stored in the IDB database. To further enhance the app's ability to work offline,
the favourite restaurant PUT request and new review POST request can be sent even while
the app is offline.

If the browser has SyncManager, the request is first stored in an outbox store in the
IDB database and a sync is registered with the service worker using a unique key.
The user's screen is then automatically updated with the new data and the request is
sent to the server as soon as there is connectivity.

#### 3. Performance

In the last two stages of the project, I was able to get the app's PWA and
Accessibility score above 90. However the performance was lagging behind. In this
stage, I was able to increase the performance score to just under 100 by lazy loading
below the fold assets.

Google Maps was taking a significant haircut off the performance score
when it was loaded at page load. I solved this issue by placing it further down the
page and loading once the user begins scrolling.
