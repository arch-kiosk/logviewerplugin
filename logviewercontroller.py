from flask import Blueprint, redirect, url_for, render_template

from flask_allows import requires
from flask_login import current_user

from authorization import MODIFY_DATA
from core.kioskcontrollerplugin import get_plugin_for_controller
from authorization import ENTER_ADMINISTRATION_PRIVILEGE, MANAGE_SERVER_PRIVILEGE, \
    IsAuthorized, is_authorized, get_local_authorization_strings, full_login_required

import urapstdlib
import kioskglobals
from kioskconfig import KioskConfig

_plugin_name_ = "logviewerplugin"
_controller_name_ = "logviewer"
_url_prefix_ = '/' + _controller_name_
plugin_version = 0.1

logviewer = Blueprint(_controller_name_, __name__,
                      template_folder='templates',
                      static_folder="static",
                      url_prefix=_url_prefix_)

LOCAL_PRIVILEGES = {
    MODIFY_DATA: "modify data",
}


@logviewer.context_processor
def inject_current_plugin_controller():
    """
    the usual not quite DRY injecttion of the current controller into JINJA
    :return: a dict as expected from JINJA
    """
    return dict(current_plugin_controller=get_plugin_for_controller(_plugin_name_))


def get_plugin_config() -> dict:
    """
    returns the plugin's config dict
    :return: a dict with the configuration of the plugin only
    """
    return kioskglobals.cfg.get_plugin_config(_plugin_name_)


#  **************************************************************
#  ****    redirecting index
#  *****************************************************************/

@logviewer.route('_redirect', methods=['GET'])
@full_login_required
@requires(IsAuthorized(ENTER_ADMINISTRATION_PRIVILEGE))
def filemanager_index():
    print("------------- redirecting")
    return redirect(url_for("filemanager.filemanager_show"))


#  **************************************************************
#  ****    /filemanager index
#  *****************************************************************/

@logviewer.route('', methods=['GET'])
@full_login_required
@requires(IsAuthorized(ENTER_ADMINISTRATION_PRIVILEGE))
# @nocache
def filemanager_show():
    conf: KioskConfig = kioskglobals.cfg
    if conf.is_in_debug_mode():
        print("\n*************** logviewer/ ")
        print(f"\nGET: get_plugin_for_controller returns {get_plugin_for_controller(_plugin_name_)}")
        print(f"\nGET: plugin.name returns {get_plugin_for_controller(_plugin_name_).name}")

    authorized_to = get_local_authorization_strings(LOCAL_PRIVILEGES)
    return render_template('logviewer.html',
                           authorized_to=authorized_to,
                           )
