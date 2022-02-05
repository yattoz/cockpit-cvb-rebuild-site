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
    }

    handleDummy = function () {
        cockpit.script("echo \"$(date)\" >> /home/yattoz/calvinball-website/podcast_resources.log");
    }

    handleRunRegenerateScript = function () {
        dbus_client.wait(function() {
            console.log("client ready!");
            console.log(dbus_client);
            dbus_client.call("/fr/calvinballconsortium/runner", "fr.calvinballconsortium.interface", "run", ["regen"]);
        });
        // cockpit.script(`dbus-send --system --print-reply --dest="fr.calvinballconsortium.service" /fr/calvinballconsortium/runner "fr.calvinballconsortium.interface.run" string:"regen"`);
    }

    handleRunRebuildScript = function () {
        // const run = `PATH="$PATH:/home/yattoz/.rbenv/bin:/home/yattoz/.rbenv/shims" && cd /home/yattoz/calvinball-website && echo "start" > start.log && git pull 2>&1 > git.log && ruby scripts/podcast_resources.rb --rebuild 2>&1 > podcast_resources.log`;
        // cockpit.script(run);
        dbus_client.wait(function() {
            console.log("client ready!");
            console.log(dbus_client);
            dbus_client.call("/fr/calvinballconsortium/runner", "fr.calvinballconsortium.interface", "run", ["rebuild"]);
        });
    }

    handleRunDevScript = function () {
        // const run = `PATH="$PATH:/home/yattoz/.rbenv/bin:/home/yattoz/.rbenv/shims" && cd /home/yattoz/calvinball-website && echo "start" > start.log && git pull 2>&1 > git.log && ruby scripts/podcast_resources.rb --dev 2>&1 > podcast_resources.log`;
        // cockpit.script(run);
        // cockpit.script(`dbus-send --system --print-reply --dest="fr.calvinballconsortium.service" /fr/calvinballconsortium/runner "fr.calvinballconsortium.interface.hello" string:"$(date)"`);
        dbus_client.wait(function() {
            console.log("client ready!");
            console.log(dbus_client);
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
                    <button onClick={this.handleRunRegenerateScript}>
                        Régénérer le site
                    </button>
                    <button onClick={this.handleRunRebuildScript}>
                        Reconstruire le site
                    </button>
                    <button onClick={this.handleRunDevScript}>
                        Reconstruire le site de test
                    </button>
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
