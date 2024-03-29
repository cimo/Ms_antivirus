import Express from "express";
import { exec } from "child_process";

// Source
import * as ControllerHelper from "../controller/Helper";
import * as ControllerUpload from "../controller/Upload";
import * as ModelHelper from "../model/Helper";

export const execute = (app: Express.Express) => {
    app.post("/msantivirus/check", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request, true)
                .then((resultList) => {
                    let fileName = "";

                    for (const value of resultList) {
                        if (value.name === "file" && value.filename) {
                            fileName = value.filename;
                        }
                    }

                    const input = `${ControllerHelper.PATH_FILE_INPUT}${fileName}`;

                    exec(`clamdscan "${input}"`, (error, stdout, stderr) => {
                        void (async () => {
                            if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                                await ControllerHelper.fileRemove(input)
                                    .then(() => {
                                        ControllerHelper.responseBody(stdout, stderr, response, 200);
                                    })
                                    .catch((error: Error) => {
                                        ControllerHelper.writeLog(
                                            "Antivirus.ts - ControllerHelper.fileRemove(input) - catch error: ",
                                            ControllerHelper.objectOutput(error)
                                        );

                                        ControllerHelper.responseBody(stdout, stderr, response, 500);
                                    });
                            } else if (stdout === "" && stderr !== "") {
                                ControllerHelper.writeLog("Antivirus.ts - exec(`clamdscan ... - stderr: ", stderr);

                                await ControllerHelper.fileRemove(input)
                                    .then()
                                    .catch((error: Error) => {
                                        ControllerHelper.writeLog(
                                            "Antivirus.ts - ControllerHelper.fileRemove(input) - catch error: ",
                                            ControllerHelper.objectOutput(error)
                                        );
                                    });

                                ControllerHelper.responseBody("", stderr, response, 500);
                            }
                        })();
                    });
                })
                .catch((error: Error) => {
                    ControllerHelper.writeLog("Antivirus.ts - ControllerUpload.execute() - catch error: ", ControllerHelper.objectOutput(error));

                    ControllerHelper.responseBody("", error, response, 500);
                });
        })();
    });

    app.post("/msantivirus/update", (request: Express.Request, response: Express.Response) => {
        const requestBody = request.body as ModelHelper.IrequestBody;

        const checkToken = ControllerHelper.checkToken(requestBody.token_api);

        if (checkToken) {
            exec("freshclam", (error, stdout, stderr) => {
                if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                    ControllerHelper.responseBody(stdout, stderr, response, 200);
                } else if (stdout === "" && stderr !== "") {
                    ControllerHelper.writeLog("Antivirus.ts - exec(`freshclam ... - stderr: ", stderr);

                    ControllerHelper.responseBody("", stderr, response, 500);
                }
            });
        } else {
            ControllerHelper.writeLog("Antivirus.ts - /msantivirus/update - tokenWrong: ", requestBody.token_api);

            ControllerHelper.responseBody("", `tokenWrong: ${requestBody.token_api}`, response, 500);
        }
    });
};
