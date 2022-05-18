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

const toggleButtons = function (enable) {
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
        const watch_lock = function (content, tag) {
            toggleButtons(tag === "-");
        };
        cockpit.file("/home/yattoz/calvinball-website/generation_token/.lock").watch(watch_lock, { read: false });
        cockpit.file("/home/yattoz/calvinball-website/next_schedule.log").watch((content, tag) => {
            // note: running at -l as podcaster doesn't output scheduled jobs for user yattoz. So we read the file instead.
            this.setState({ at_schedule_str: content });
            console.log(content.split("\n"));
        });
    }

    handleDummy = function () {
        cockpit.script("echo \"$(date)\" >> /home/yattoz/calvinball-website/podcast_resources.log");
    }

    handleRunRegenerateScript = function () {
        const promise = cockpit.user();
        promise.then(user => {
            toggleButtons(false); // we'll declare the button toggle before the file creation to avoid people clicking twice...
            dbus_client.wait(function () {
                dbus_client.call("/fr/calvinballconsortium/runner", "fr.calvinballconsortium.interface", "run", ["regen", user.name]);
            });
        });
    }

    handleRunRebuildScript = function () {
        const promise = cockpit.user();
        promise.then(user => {
            toggleButtons(false); // we'll declare the button toggle before the file creation to avoid people clicking twice...
            dbus_client.wait(function () {
                dbus_client.call("/fr/calvinballconsortium/runner", "fr.calvinballconsortium.interface", "run", ["rebuild", user.name]);
            });
        });
    }

    handleRunDevScript = function () {
        const promise = cockpit.user();
        promise.then(user => {
            toggleButtons(false); // we'll declare the button toggle before the file creation to avoid people clicking twice...
            dbus_client.wait(function () {
                dbus_client.call("/fr/calvinballconsortium/runner", "fr.calvinballconsortium.interface", "run", ["dev", user.name]);
            });
        });
    }

    handleHoverRegen = function () {
        const regen_info = document.getElementById("regen-info");
        const rebuild_info = document.getElementById("rebuild-info");
        const dev_info = document.getElementById("dev-info");
        const blank_info = document.getElementById("blank-info");

        regen_info.style.display = "block";
        rebuild_info.style.display = "none";
        dev_info.style.display = "none";
        blank_info.style.display = "none";
    }

    handleHoverRebuild = function () {
        const regen_info = document.getElementById("regen-info");
        const rebuild_info = document.getElementById("rebuild-info");
        const dev_info = document.getElementById("dev-info");
        const blank_info = document.getElementById("blank-info");

        regen_info.style.display = "none";
        rebuild_info.style.display = "block";
        dev_info.style.display = "none";
        blank_info.style.display = "none";
    }

    handleHoverDev = function () {
        const regen_info = document.getElementById("regen-info");
        const rebuild_info = document.getElementById("rebuild-info");
        const dev_info = document.getElementById("dev-info");
        const blank_info = document.getElementById("blank-info");

        regen_info.style.display = "none";
        rebuild_info.style.display = "none";
        dev_info.style.display = "block";
        blank_info.style.display = "none";
    }

    handleHoverOut = function () {
        // const regen_info = document.getElementById("regen-info");
        // const rebuild_info = document.getElementById("rebuild-info");
        // const dev_info = document.getElementById("dev-info");
        // const blank_info = document.getElementById("blank-info");

        // regen_info.style.display = "none";
        // rebuild_info.style.display = "none";
        // dev_info.style.display = "none";
        // blank_info.style.display = "block";
    }

    /*
        <Alert
            variant="info"
            title={cockpit.format(_("Running on $0"), this.state.hostname)}
        />
    */

    render() {
        return (
            <Card>
                <CardTitle>Regénérer le site Calvinballconsortium.fr</CardTitle>
                <CardBody>
                    <div className="buttonControlPanel">
                        <div className="buttonBox">
                            <button id="regen" className="btn" onMouseOut={this.handleHoverOut} onMouseOver={this.handleHoverRegen} onClick={this.handleRunRegenerateScript}>
                                Mettre à jour les site pour les podcasts tiers
                            </button>
                            <button id="rebuild" className="btn" onMouseOut={this.handleHoverOut} onMouseOver={this.handleHoverRebuild} onClick={this.handleRunRebuildScript}>
                                Mettre à jour le site
                            </button>
                            <button id="dev" className="btn" onMouseOut={this.handleHoverOut} onMouseOver={this.handleHoverDev} onClick={this.handleRunDevScript}>
                                Mettre à jour le site de test
                            </button>
                        </div>
                        <div>
                            <div id="blank-info">
                                <div className="title-info">
                                    Survolez un bouton pour voir les actions associées.
                                </div>
                            </div>
                            <div id="regen-info" className="buttonDescription">
                                <div className="title-info">
                                    Mettre à jour les site pour les podcasts tiers
                                </div>
                                <ul>
                                    <li>
                                        ✅ Actualise les podcasts non-hébergés sur le serveur (par ex. ceux qui sont sur Wordpress, Soundcloud, Hear.this...)
                                    </li>
                                    <li>
                                        ✅ Détecte les épisodes manuellement uploadés sur le serveur mais avec une date future, et programme la mise à jour future.
                                    </li>
                                    <li>
                                        ❌ Ne met pas à jour le site avec les podcasts manuellement uploadés sur le serveur.
                                    </li>
                                    <li>
                                        ❌ Ne met pas à jour les flux RSS des podcasts manuellement uploadés sur le serveur.
                                    </li>
                                </ul>
                            </div>
                            <div id="rebuild-info" className="buttonDescription">
                                <div className="title-info">
                                    Mettre à jour le site
                                </div>
                                <ul>
                                    <li>
                                        ✅ Met à jour le site avec les podcasts non-hébergés sur le serveur (par ex. ceux qui sont sur Wordpress, Soundcloud, Hear.this...)
                                    </li>
                                    <li>
                                        ✅ Met à jour le site avec les podcasts manuellement uploadés sur le serveur.
                                    </li>
                                    <li>
                                        ✅ Met à jour les flux RSS des podcasts manuellement uploadés sur le serveur.
                                    </li>
                                    <li>
                                        ✅ Détecte les épisodes manuellement uploadés sur le serveur mais avec une date future, et programme la mise à jour future.
                                    </li>
                                </ul>
                            </div>
                            <div id="dev-info" className="buttonDescription">
                                <div className="title-info">
                                    Mettre à jour le site de test
                                </div>
                                <ul>
                                    <li>
                                        ✅ Détecte les épisodes manuellement uploadés sur le serveur mais avec une date future, et programme la mise à jour future.
                                    </li>
                                    <li>
                                        🧪 Met à jour <b>le site de test</b> avec les podcasts non-hébergés sur le serveur (par ex. ceux qui sont sur Wordpress, Soundcloud, Hear.this...)
                                    </li>
                                    <li>
                                        🧪 Met à jour <b>le site de test</b> avec les podcasts manuellement uploadés sur le serveur.
                                    </li>
                                    <li>
                                        🧪 Met à jour <b>les flux RSS exclusifs au site de test</b> avec les podcasts manuellement uploadés sur le serveur.
                                    </li>
                                    <li>
                                        ❌ Ne met pas à jour les flux RSS du site principal (c'est celui de vos auditeurs) avec les podcasts manuellement uploadés sur le serveur.
                                    </li>
                                    <p>
                                        Tous les changements n'apparaissent <b>uniquement que sur <a href="https://dev.calvinballconsortium.fr">https://dev.calvinballconsortium.fr</a></b>
                                    </p>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="next-updates">
                        <Alert
                            variant="info"
                            title={cockpit.format(_("Mises à jour du site programmées (heure de Paris)"), this.state.hostname)}
                        >
                            {(this.state.at_schedule_str !== undefined && this.state.at_schedule_str === "") ? "Aucune mise à jour prévue" : ""}
                            <ul>
                                {(this.state.at_schedule_str !== undefined && this.state.at_schedule_str !== "") ? this.state.at_schedule_str.split("\n").map((item, index) => <li key={index}> {item} </li>) : ""}
                            </ul>
                        </Alert>
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
