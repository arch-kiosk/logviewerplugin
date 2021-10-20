# logviewerplugin
A kiosk plugin that helps administrators to view log files.
It helps filtering, coloring and querying log lines under administration. 

This is the first plugin developed outside of the main repository.

# how to install it
with a running kiosk just copy the contents of this repos to /plugins/logviewerplugin and add the plugin to the kiosk_config.yml:

``` yaml
kiosk:
  logviewerplugin:
    active: true
    is_main_index: false
    menu:
      "analyze logs": ["+administrationplugin"]

```

# configure local development
To connect to a locally running kiosk instance during development
of the js app part you want to create a .env.development.local file
 under /logviewerapp/ with these settings:
```
VITE_DEV_API_URL=http://localhost:5000/api
VITE_DEV_API_USER=your kiosk user id
VITE_DEV_API_PWD=your local kiosk user's password 
```
Vite (our bundler/build tool) uses dotenv to makes those constants
available in js. So the syntax follows the dotenv specifications.

# more configuration
The client part of the app tries to fetch the global styles.css stylesheet directly from kiosk. That's why you have to configure the base-url for kiosk for development:
```
VITE_KIOSK_BASE_URL=http://localhost:5000/
```
In production VITE_KIOSK_BASE_URL is set simply to "/" by .env.production.
