import Express from "express";
import Path from "path";
import { exec } from "child_process";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ControllerUpload from "../Controller/Upload";

export const execute = (app: Express.Express): void => {
    app.post("/msantivirus/check", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request)
                .then((result) => {
                    const input = result.input;

                    exec(`clamdscan "${input}"`, (error, stdout, stderr) => {
                        void (async () => {
                            ControllerHelper.fileRemove(input);

                            if (stdout !== "" && stderr === "") {
                                ControllerHelper.writeLog("Antivirus.ts - exec('clamdscan... - stdout", stdout);

                                response.status(200).send({ Response: stdout });
                            } else if (stdout === "" && stderr !== "") {
                                ControllerHelper.writeLog("Antivirus.ts - exec('clamdscan... - stderr", stderr);

                                response.status(500).send({ Error: stderr });
                            }
                        })();
                    });
                })
                .catch(() => {
                    response.status(500).send({ Error: "Upload failed." });
                });
        })();
    });

    app.post("/msantivirus/update", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            const check = ControllerHelper.checkToken(request.body.token_api);

            if (check) {
                exec("freshclam", (error, stdout, stderr) => {
                    void (async () => {
                        if (stdout !== "" && stderr === "") {
                            ControllerHelper.writeLog("Antivirus.ts - exec('freshclam --quiet... - stdout", stdout);

                            response.status(200).send({ Response: stdout });
                        } else if (stdout === "" && stderr !== "") {
                            ControllerHelper.writeLog("Antivirus.ts - exec('freshclam --quiet... - stderr", stderr);

                            response.status(500).send({ Error: stderr });
                        }
                    })();
                });
            } else {
                ControllerHelper.writeLog("Antivirus.ts - app.post('/msantivirus/update' - error token_api", request.body.token_api);

                response.status(500).send({ Error: "token_api not valid!" });
            }
        })();
    });
};
