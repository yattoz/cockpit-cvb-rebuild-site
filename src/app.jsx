/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React from 'react';
import { Alert, Card, CardTitle, CardBody } from '@patternfly/react-core';

const _ = cockpit.gettext;
const dbus_client = cockpit.dbus("fr.calvinballconsortium.service", { bus: "system" });

const toggleButtons = function(enable) {
    const button_regen = document.getElementById("regen");
    const button_rebuild = document.getElementById("rebuild");
    const button_dev = document.getElementById("dev");
    button_regen.disabled = !enable;
    button_rebuild.disabled = !enable;
    button_dev.disabled = !enable;
};

export class Application extends React.Component {
    constructor() {
        super();
        this.state = { hostname: _("Unknown") };

        cockpit.file('/etc/hostname').watch(content => {
            this.setState({ hostname: content.trim() });
        });
        cockpit.file('/home/yattoz/calvinball-website/podcast_resources.log').watch(content => {
            this.setState({ log: content });
        });
        const watch_lock = function(content, tag) {
            toggleButtons(tag === "-");
        };
        cockpit.file("/home/yattoz/calvinball-website/generation_token/.lock").watch(watch_lock, { read: false });
    }

    handleDummy = function () {
        cockpit.script("echo \"$(date)\" >> /home/yattoz/calvinball-website/podcast_resources.log");
    }

    handleRunRegenerateScript = function () {
        toggleButtons(false); // we'll declare the button toggle before the file creation to avoid people clicking twice...
        dbus_client.wait(function() {
            dbus_client.call("/fr/calvinballconsortium/runner", "fr.calvinballconsortium.interface", "run", ["regen"]);
        });
    }

    handleRunRebuildScript = function () {
        toggleButtons(false); // we'll declare the button toggle before the file creation to avoid people clicking twice...
        dbus_client.wait(function() {
            dbus_client.call("/fr/calvinballconsortium/runner", "fr.calvinballconsortium.interface", "run", ["rebuild"]);
        });
    }

    handleRunDevScript = function () {
        toggleButtons(false); // we'll declare the button toggle before the file creation to avoid people clicking twice...
        dbus_client.wait(function() {
            dbus_client.call("/fr/calvinballconsortium/runner", "fr.calvinballconsortium.interface", "run", ["dev"]);
        });
    }

    render() {
        return (
            <Card>
                <CardTitle>Regénérer le site Calvinballconsortium.fr</CardTitle>
                <CardBody>
                    <Alert
                        variant="info"
                        title={cockpit.format(_("Running on $0"), this.state.hostname)}
                    />
                    <div className="buttonBox">
                        <button id="regen" className="btn" onClick={this.handleRunRegenerateScript}>
                            Régénérer le site
                        </button>
                        <button id="rebuild" className="btn" onClick={this.handleRunRebuildScript}>
                            Reconstruire le site
                        </button>
                        <button id="dev" className="btn" onClick={this.handleRunDevScript}>
                            Reconstruire le site de test
                        </button>
                    </div>
                    <div>
                        <pre>
                            {this.state.log}
                        </pre>
                    </div>
                </CardBody>
            </Card>
        );
    }
}
