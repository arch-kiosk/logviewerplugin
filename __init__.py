import logging
import sys
from typing import Union

from flask import url_for

if "mcpcore.mcpworker" not in sys.modules:
    from core.kioskcontrollerplugin import KioskControllerPlugin
    from kioskmenuitem import KioskMenuItem
    from flask_login import current_user
    from .logviewercontroller import logviewer
    from .logviewercontroller import plugin_version
    from .logviewercontroller import register_resources
    from authorization import ENTER_ADMINISTRATION_PRIVILEGE

plugin: Union[KioskControllerPlugin, None] = None


def get_plugin_version():
    return plugin_version


def instantiate_plugin_object(name, package):
    return KioskControllerPlugin(name, package)


def init_app(app, api=None):
    app.register_blueprint(logviewer)

    if api:
        register_resources(api)
        return True
    else:
        logging.error("logviewerplugin/__init__.py/init_app: api is None.")
        return False


def register_plugin_instance(plugin_to_register):
    global plugin
    plugin = plugin_to_register


def all_plugins_ready():
    global plugin
    plugin._app.events.subscribe("administration", "show_log", administration_show_log)
    logging.debug(f"PluginLocusRelationsHook subscribed to synchronization.after_synchronization")


def administration_show_log(filename):
    return url_for("logviewer.logviewer_show", filename=filename)


def register_menus():
    """
    registeres the menu items to be shown for this plugin.
    :return: an array of KioskMenuItem instances
    """
    global plugin
    return []


def register_global_routes():
    global plugin
    return []


def register_global_scripts():
    # return {"fileimportplugin": ["fileimport.static", "scripts/fileimport.js", "async"]}
    return {}
