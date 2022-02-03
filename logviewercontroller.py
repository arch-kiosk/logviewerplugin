import logging
import os
from http import HTTPStatus

from flask import abort as flask_abort
from flask import Blueprint, redirect, url_for, render_template

from flask_allows import requires
from flask_login import current_user

import kioskstdlib
from authorization import MODIFY_DATA
from core.kioskcontrollerplugin import get_plugin_for_controller
from authorization import ENTER_ADMINISTRATION_PRIVILEGE, MANAGE_SERVER_PRIVILEGE, \
    IsAuthorized, is_authorized, get_local_authorization_strings, full_login_required

import kioskglobals
from kioskglobals import httpauth, get_config
from kioskconfig import KioskConfig

from flask_restful import Resource, abort
from core.kioskapi import KioskApi
from api.kioskapi import PublicApiInfo
from marshmallow import Schema, fields, ValidationError

_plugin_name_ = "logviewerplugin"
_controller_name_ = "logviewer"
_url_prefix_ = '/' + _controller_name_
plugin_version = 1.0

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
#  ****    /logviewer index
#  *****************************************************************/

@logviewer.route('/<string:filename>', methods=['GET'])
@full_login_required
@requires(IsAuthorized(ENTER_ADMINISTRATION_PRIVILEGE))
# @nocache
def logviewer_show(filename):
    conf: KioskConfig = kioskglobals.cfg
    if conf.is_in_debug_mode():
        print("\n*************** logviewer/ ")
        print(f"\nGET: get_plugin_for_controller returns {get_plugin_for_controller(_plugin_name_)}")
        print(f"\nGET: plugin.name returns {get_plugin_for_controller(_plugin_name_).name}")

    filename = kioskstdlib.urap_secure_filename(filename)
    if not filename:
        flask_abort(HTTPStatus.BAD_REQUEST, 'no log file given.')

    log_file = os.path.join(kioskstdlib.get_file_path(conf.get_logfile()), filename)
    if not os.path.exists(log_file):
        flask_abort(HTTPStatus.NOT_FOUND, 'File not found.')

    authorized_to = get_local_authorization_strings(LOCAL_PRIVILEGES)
    return render_template('logviewer.html',
                           authorized_to=authorized_to,
                           log_filename=filename
                           )


#  **************************************************************
#  ****    api stuff
#  *****************************************************************/

def register_resources(api: KioskApi):
    api.add_resource(V1LogViewerApiInfo, '/logviewer/v1/api-info', endpoint='logviewer-v1-api-info')
    api.spec.components.schema("LogViewerApiInfoV1", schema=LogViewerApiInfoV1)
    api.spec.path(resource=V1LogViewerApiInfo, api=api, app=api.flask_app)

    api.add_resource(V1LogViewerLogLines, '/logviewer/v1/<string:filename>/log-lines', endpoint='logviewer-v1-log-lines')
    api.spec.components.schema("LogViewerLogLinesV1", schema=LogViewerApiLogLinesV1)
    api.spec.path(resource=V1LogViewerLogLines, api=api, app=api.flask_app)


class LogViewerApiInfoV1(PublicApiInfo):
    class Meta:
        fields = (*PublicApiInfo.Meta.fields, "api", "version", "project")
        ordered = True


class LogViewerApiLogLinesV1(PublicApiInfo):
    class Meta:
        fields = ("filename", "log_lines")

    filename: fields.String
    log_lines: fields.List(fields.String)


class V1LogViewerApiInfo(Resource):

    @httpauth.login_required
    def get(self):
        ''' retrieve information about the logviewer api.
            ---
            summary: retrieve information about the synchronization manager api.
            security:
                - jwt: []
            responses:
                '200':
                    description: returns basic information about the api in the body
                    content:
                        application/json:
                            schema: LogViewerApiInfoV1
                '401':
                    description: authorization failed / unauthorized access
                    content:
                        application/json:
                            schema: LoginError
        '''
        cfg = get_config()
        return LogViewerApiInfoV1().dump({
            'api': 'logviewer',
            'version': plugin_version,
            'project': cfg.config["project_id"],
        })


class V1LogViewerLogLines(Resource):
    @httpauth.login_required
    def get(self, filename: str):
        ''' retrieve log lines of a log file
            ---
            summary: retrieve information about the synchronization manager api.
            summary: cancels the running job of a workstation
            security:
                - jwt: []
            parameters:
                    - in: path
                      name: filename
                      required: true
                      schema:
                        type: string
                        minimum: 1
                      description: filename of the log file
            responses:
                '200':
                    description: ok, log lines included
                    content:
                        application/json:
                            schema: LogViewerApiLogLinesV1
                '401':
                    description: authorization failed / unauthorized access
                    content:
                        application/json:
                            schema: LoginError
        '''
        cfg = get_config()
        filename = kioskstdlib.urap_secure_filename(filename)
        if kioskstdlib.get_file_extension(filename) == "":
            filename += ".log"
        elif kioskstdlib.get_file_extension(filename).lower() != "log":
            abort(HTTPStatus.BAD_REQUEST, description=f"log file must have extension .log")

        log_dir = kioskstdlib.get_file_path(cfg.get_logfile())
        log_file = os.path.join(log_dir, filename)
        check_dir = kioskstdlib.get_file_path(log_file)

        # This is paranoid since urap_secure_filename should not allow for path-like parts, but ...
        if check_dir.lower() != log_dir.lower():
            abort(HTTPStatus.BAD_REQUEST, description=f"malicious attempt to tamper with the filename and path.")

        if kioskstdlib.file_exists(log_file):
            log_lines = []
            try:
                with open(log_file, "r") as text_file:
                    log_lines = text_file.readlines()
            except BaseException as e:
                logging.error(f"{self.__class__.__name__}.get: error reading file {log_file}: {repr(e)}")
                abort(500, description=f"error reading file {log_file}: {repr(e)}")
        else:
            abort(HTTPStatus.NOT_FOUND, description=f"log file {log_file} not found")

        return LogViewerApiLogLinesV1().dump({
            'filename': filename,
            'log_lines': log_lines
        })
