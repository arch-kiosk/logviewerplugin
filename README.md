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



